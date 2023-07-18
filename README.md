# Spy Cat

**Spy Cat**은 사용자가 보유 중인 서버의 트래픽과 에러를 시각화해주는 웹 애플리케이션입니다.  
Spy Cat에서 자신의 서버를 등록하고, 간단한 미들웨어 함수를 서버 소스코드에 추가해 다양한 정보를 쉽게 시각화된 차트로 확인할 수 있습니다.

<img src="https://github.com/gunhwalee/spycat-server/assets/110829006/6a177964-37ef-421e-89a2-fa8a6db81693" width="500">

👉[지금 바로 사용해보기](https://spycat.netlify.app)

# Table of Contents

- [Motivation](#motivation)
- [Challenges](#challenges)
  - [어떻게 서버에서 발생한 트래픽과 에러의 정보를 수집할 수 있을까?](#1-어떻게-서버에서-발생한-트래픽과-에러의-정보를-수집할-수-있을까)
    - [트래픽을 어떻게 수집할 것인가?](#1-트래픽을-어떻게-수집할-것인가)
    - [내가 만든 미들웨어를 사용자의 코드에서 실행시키는 방법?](#2-내가-만든-미들웨어를-사용자의-코드에서-실행시키는-방법)
  - [어떻게 수집한 정보를 구조화할 것인가?](#2-어떻게-수집한-정보를-구조화할-것인가)
    - [Populate?](#1-populate)
    - [참조된 문서를 삭제할 때는?](#2-참조된-문서를-삭제할-때는)
  - [어떻게 데이터를 시각화할 것인가?](#3-어떻게-데이터를-시각화할-것인가)
    - [SVG vs Canvas API](#1-svg-vs-canvas-api)
    - [차트를 그릴 데이터를 어떻게 정리할까?](#2-차트를-그릴-데이터를-어떻게-정리할까)
  - [어떻게 사용자 경험을 적용할까?](#4-어떻게-사용자경험ux을-적용할까)
    - [슬라이드 메뉴에 UX 적용하기](#1-슬라이드-메뉴에-ux-적용하기)
    - [컴포넌트간의 로직을 공유해 보자](#2-컴포넌트간의-로직을-공유해-보자)
    - [사용자가 불편한 부분을 없애보자](#3-사용자가-불편한-부분을-없애보자)
  - [클라이언트와 서버의 통신문제?](#5-클라이언트와-서버의-통신문제)
    - [무분별한 서버요청을 차단해 보자](#1-무분별한-서버요청을-차단해-보자)
    - [로그인 쿠키 문제](#2-로그인-쿠키-문제)
- [Features](#features)
- [Usage](#usage)
- [Tech Stacks](#tech-stacks)
- [Links](#links)
- [Schedule](#schedule)

# Motivation

종종 '하루에 내 서버에 들어오는 요청은 얼마나 될까?'라는 생각을 해보곤 했습니다.

그러던 중에 Datadog과 Newrelic에서 관련 서비스를 제공하는 것을 확인하고 유사한 Observability 애플리케이션을 만들어보고자 했습니다.

서버에서 발생한 트래픽과 에러를 수집하고 이를 시각화하면서 클라이언트와 서버에서 방대한 양의 데이터를 효율적으로 다룰 기회라고 생각했습니다.

# Challenges

## 1. 어떻게 서버에서 발생한 트래픽과 에러의 정보를 수집할 수 있을까?

### 1) 트래픽을 어떻게 수집할 것인가?

- 트래픽의 정의

  트래픽이란 **웹사이트에 방문한 사람들이 데이터를 주고받은 양** 을 뜻합니다.

  데이터를 주고받는다 함은 클라이언트의 요청에 대한 서버의 응답을 나타냅니다. 따라서 트래픽은 서버에 들어오는 요청으로 확인할 수 있었습니다. 또한 서버가 클라이언트로 부터 요청을 받을 때 항상 개별 요청으로 받기 때문에 각각의 트래픽을 감지하는 것은 어렵지 않았습니다.

- 접근 방법

1. 우선 정보를 받아올 미들웨어 함수를 작성했습니다. 클라이언트로부터 들어온 1개의 요청은 서버에서 1개의 응답이 나가야 요청-응답 주기가 종료된다는 점을 이용했습니다.

2. 미들웨어 함수는 요청-응답 주기를 종료하거나 다음 스택의 미들웨어로 제어권을 넘기는 것을 선택할 수 있습니다. 따라서 작성한 미들웨어 함수에서 요청 객체(`req`)에 들어있는 필요한 정보를 얻은 후 다음 스택의 미들웨어 함수를 호출해 제어권을 넘겼습니다.
   <details>
      <summary>코드</summary>
      <div markdown="1">

   ```js
   const trafficParser = async function (req, res, next) {
     try {
       const response = await axios.post("server-url", "traffic-info");
       console.log(response.data);
     } catch (error) {
       console.error("Error sending traffic data:", error.message);
     }
     next();
   };
   ```

      </div>
    </details>

3. 그리고 각 트래픽이 분기되는 라우팅 분기점보다 위쪽에서 미들웨어 함수를 호출했습니다.  
   `Express`에서 미들웨어는 스택구조로 호출 순서에 따라 영향을 받습니다. 코드의 상단에 위치할수록 먼저 실행됩니다.
   따라서 작성한 미들웨어 함수를 라우팅 분기점보다 위쪽에서 호출함으로써 트래픽이 라우팅별로 나눠지기 전에 해당 미들웨어 함수를 거쳐 모든 트래픽에 대해 접근이 가능했습니다.

   <details>
      <summary>코드</summary>
      <div markdown="1">

   ```js
   app.use(trafficParser()); // 라우팅 분기점 위에서 요청객체의 정보를 얻고 라우팅으로 요청 객체를 넘김

   app.use("/", indexRouter);
   app.use("/users", usersRouter);
   ```

      </div>
    </details>

4. 에러 정보를 처리하는 미들웨어 함수를 별도로 만들어 서버의 에러 핸들러 바로 위에서 호출했습니다.  
   `Express`에서 발생한 에러는 각 미들웨어에서 `next(error)`를 호출함으로써 일반 미들웨어를 지나쳐 에러 처리 미들웨어로 제어권을 넘깁니다.  
   그렇기때문에 통상적으로 에러 핸들러를 서버 코드의 가장 하단에서 호출해 어느 로직에서든 발생한 에러를 처리할 수 있게됩니다.  
   따라서 제가 작성한 미들웨어 함수를 서버의 에러 핸들러 바로 위에 호출함으로써 서버에서 발생한 모든 에러가 해당 미들웨어를 거치도록 했습니다.

   <details>
      <summary>코드</summary>
      <div markdown="1">

   ```js
    app.use(errorParser()); // 서버의 에러핸들러 바로 위에서 에러객체의 정보를 얻고 에러핸들러로 에러 객체를 넘김

    // error handler
    app.use(function (err, req, res, next) {
      ...
    });
   ```

      </div>
    </details>

### 2) 내가 만든 미들웨어를 사용자의 코드에서 실행시키는 방법

- 문제점

  사용자의 서버에서 발생한 트래픽과 에러 정보를 접수하기 위해서는 제가 작성한 미들웨어 함수를 사용자가 직접 자신의 서버 소스코드에서 호출해야만 했습니다.

- 접근 방법

  **npm패키지 모듈 작성하기**

  프로젝트의 특성상 서비스 사용자의 경우 Node.js 기반 서버를 보유하고 있는 개발자일 경우가 100%입니다. 따라서 누구든 접근하고 사용하기 쉬운 방법으로 npm 패키지가 적합하다고 생각했습니다.

  1. 먼저 새로운 디렉터리에서 `npm init` 명령어를 통해 `package.json`파일을 생성하고 모듈에 대한 간단한 정보를 기재했습니다.

  2. 모듈이 사용될 때 로드할 파일을 만들고 작성한 함수를 `exports`객체의 속성으로 추가했습니다.

  ```js
  exports.trafficParser = async function (req, res, next) {
    ...
    next();
  };

  exports.errorParser = async function (err, req, res, next) {
    ...
    next();
  };
  ```

  3. 해당 모듈을 npm사용자라면 누구든 사용할 수 있게 `unscoped public package`로 배포했습니다.

  ```js
  const { trafficParser, errorParser } = require("spycat-tracker");
  ```

  [npm패키지 링크](https://github.com/gunhwalee/spycat-tracker)

<br>

**아쉬운 점**

기능 구현을 마친 뒤 추가적으로 위의 두 개의 함수를 하나로 합칠 수 있다면 사용자 편의성이 좋아질 것 같아 고민해 보았습니다.  
하지만 라우팅별 분기 처리가 되기 전에 정보를 받아야 하는 트래픽과 반대로 각 분기 내에서 발생한 에러를 동시에 받을 수 있는 적절한 위치를 현재 능력으로는 찾기 어려웠습니다. 추가적인 리서치도 시도해 봤지만 큰 소득은 없었고, 해결하지 못한 부분이 아쉬웠습니다.

<br>

## 2. 어떻게 수집한 정보를 구조화할 것인가?

사용자의 서버에서 수집된 정보와 클라이언트에서 사용자의 입력에 따라 저장된 정보를 어떻게 구조화할 것인지가 두 번째 고민이었습니다.

최종적으로 서버에서 관리해야 할 자원(정보)은 유저정보, 서버목록, 트래픽, 에러 4가지였습니다. 그리고 각 자원은 명확한 계층 관계가 존재했습니다. (유저정보 > 서버 목록 > 트래픽, 에러)

프로젝트 기획 단계에서 이런 계층 관계를 바탕으로 DB Modeling을 먼저 구성했습니다.

<img width="450" alt="DB Modeling" src="https://github.com/gunhwalee/spycat-client/assets/110829006/e4f61db0-49bb-4cf5-b335-53e658409ca5">

### 1) Populate?

- 문제점

  하지만 위의 구성처럼 깊은 객체 형식으로 자원을 관리하는 것은 지양해야 했습니다. 자원에 대한 접근과 수정 관련 코드의 인덴팅이 깊어지고 이는 코드 가독성과 유지 보수 측면에서 좋지 않다고 판단했습니다.

- 접근 방법

  `Mongoose`의 `populate`기능을 적용했습니다.

  우선 깊은 객체 형태의 구조를 피하기 위해 각 자원을 별도의 모델로 구성해 DB에서 각각의 문서를 저장하도록 했습니다.

  이렇게 될 경우 각 자원 사이의 계층 관계를 잃어버릴 수 있는데, `populate`기능을 사용해 다른 문서를 참조할 수 있도록 보완했습니다.

  ```js
  // Schema
  const serverSchema = new mongoose.Schema({
    ...
    traffics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Traffic" }], // Traffic 문서를 참조
  });

  // handler function
  const server = await Server.findOne({ apikey }).populate("traffics"); // populate기능으로 server 문서에 참조되어 있는 traffics데이터를 함께 가져온다.
  ```

### 2) 참조된 문서를 삭제할 때는?

- 문제점

  전송받은 트래픽과 에러 정보를 무한정 저장하기에는 DB 용량 문제가 있어 `expires`속성을 적용해 일정 기간 이후 자동으로 삭제되도록 구현했습니다. 그리고 설정한 시간을 경과한 이후에 트래픽과 에러 정보가 DB에서 자동적으로 삭제되는 걸 확인했지만 문제는 다른 곳에 있었습니다.

  서버 문서에서 참조돼있는 트래픽과 에러 정보에 대한 ID 값이 삭제되지 않는 문제였습니다.

- 접근 방법

  `Mongoose`의 `Model.watch()` API를 적용했습니다.

  해당 API는 DB에 변경사항이 있는지 컬렉션을 감시하는 기능이 있습니다. `change`, `error`, `end`, `close` 이벤트를 감지할 수 있으며 해당 이벤트가 발생했을 때 전달받은 콜백 함수를 호출합니다.

  또한 `change` 이벤트에는 `operationType`이라는 속성이 존재해 생성, 삭제 등을 구분할 수 있었습니다.

  ```js
  Traffic.watch().on("change", async change => {
    if (change.operationType === "delete") {
      // 문서가 삭제되는 경우를 감지
      const { _id } = change.documentKey;
      await Server.updateMany({ traffics: _id }, { $pull: { traffics: _id } }); // Server 컬렉션에서 해당 _id를 참조하고 있는 모든 문서를 업데이트
    }
  });
  ```

## 3. 어떻게 데이터를 시각화할 것인가?

차트를 그리는 라이브러리는 많았지만 기술 스택을 다듬고 성장하는 과정이기에 라이브러리 없이 차트를 구현해 보고자 했습니다.

### 1) SVG vs Canvas API

리서치 결과 많은 개발자들이 차트를 구현할 때 `SVG` 또는 `Canvas API`를 사용한다는 정보를 얻었습니다. 추가적으로 둘의 장단점을 찾아보며 이번 프로젝트에 알맞은 방법이 무엇인지 고민해 봤습니다.

- 차이점

  |                   SVG                   |                  Canvas API                  |
  | :-------------------------------------: | :------------------------------------------: |
  |   확장성이 뛰어나고 고해상도를 지원함   |  확장성이 떨어지고 고해상도에 적합하지 않음  |
  |     스크립트와 CSS 모두 수정 가능함     |           스크립트로만 수정이 가능           |
  | 다중 그래픽 요소로 이벤트 등록이 간편함 | 단일 HTML 요소로 이벤트 등록이 비교적 복잡함 |

- 테스트 결과

  동일한 원형 요소를 구현했을 경우 `SVG`와 `Canvas API`를 작성하는 코드량은 아래와 같이 차이가 있었습니다.  
  또한 애니메이션 측면에서도 `SVG`는 `animate`요소로 간단하게 구현이 가능했지만, `Canvas API`는 작성해야 하는 스크립트 양이 월등히 많고 복잡했습니다.

  ```js
  // SVG
  <svg width="100" height="100">
    <circle cx="50" cy="50" r="45" fill="#FFA69E">
      <animate
        attributeName="r"
        values="10; 45; 10"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>;

  // Canvas API - <script>
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFA69E";

  let r = 10;
  let increase = true;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    ctx.arc(50, 50, r, 0, 2 * Math.PI);
    ctx.fill();

    if (r >= 45) increase = false;
    if (r === 10) increase = true;

    if (increase && r < 45) {
      r += 1;
    } else if (!increase && r >= 10) {
      r -= 1;
    }

    requestAnimationFrame(draw);
  }

  draw();
  ```

- 선택한 방법: `SVG`

  이번 프로젝트의 경우 웹브라우저 화면으로 대형 사이즈의 차트를 제공해야 했으므로 고해상도의 그래픽이 필요했습니다. 그래프를 렌더링 할 때 애니메이션도 추가하고자 했습니다.  
  그리고 차트 요소를 클릭했을 때 상세 차트가 추가로 렌더링 되는 클릭 이벤트를 그래픽 요소에 추가하려고 했습니다.

  해상도, 애니메이션 효과, 이벤트 등록 등을 고려했을 때 `SVG`가 더 적합하다고 생각했습니다. 선정한 `SVG`를 이용해 웹브라우저에서도 선명하고 간단한 애니메이션 효과를 추가한 차트를 손쉽게 구현할 수 있었습니다.

  <img width="450" src="https://github.com/gunhwalee/spycat-client/assets/110829006/9810a40f-4675-4d4b-b1cb-4170c5f1f4f3" alt="main chart">

### 2) 차트를 그릴 데이터를 어떻게 정리할까?

- 접근 방법

1. 직접 `SVG`를 이용한 차트 구현을 해본 경험이 없었기 때문에 차트를 구현할 함수를 먼저 작성해 보고
2. 그 이후에 차트에 필요한 데이터 포맷을 기준으로 DB에 저장된 정보를 가공하기로 결정했습니다.

- 차트 구현 (도넛 차트)

  1. 데이터마다 `circle`요소를 만들고 `stroke-width`속성을 사용해 도넛 형태의 이미지를 구현했습니다.
  2. 각 데이터 항목이 전체 데이터에서 차지하는 비중을 구하고, `stroke-dasharray`속성에서 대시와 공백을 표시하는 변수를 활용했습니다.
     - `const strokeLength = circumference * ratio;` (데이터가 차지하는 비중만큼의 길이)
     - `const spaceLength = circumference - strokeLength;` (데이터를 제외한 공백의 길이)
     - `strokeDasharray={strokeLength spaceLength}` (데이터의 비중만큼 `circle`요소의 길이 조절)
  3. 각 `circle`요소가 동일한 시작점에서 그려지기 때문에, `stroke-dashoffset`속성을 조절했습니다.
     - `filled += ratio;` (각 데이터 직전까지의 누적 비중)
     - `const offset = fiiled * circumference`
     - `strokeDashoffset={-offset}` (`circle`요소의 시작지점)

<br>

- 구현 결과

  [작성 코드](https://github.com/gunhwalee/spycat-client/blob/main/src/charts/DonutChart.js)

  <img src="https://github.com/gunhwalee/spycat-client/assets/110829006/5bb7b5b4-9bb7-4f62-9d39-de9aace75266" width="250" alt="donut chart">

<br>

- 데이터 가공

  만들어진 함수를 이용하기 위해서 데이터는 이름(라벨)과 값 속성을 가진 객체로 이루어져야 했습니다. 따라서 DB에서 넘어온 데이터를 아래와 같은 형식으로 가공해야 했습니다.

  ```js
  // DB 데이터
  const data1 = {
    path: "/",
    server: ObjectId,
    createAt: 2023-05-29T05:30:20.051+00:00,
  };

  const traffics = [data1, data2, ...];

  // 타깃 형식
  const routesTraffics = [
    { name: "/", value: 24 },
    { name: "/login", value: 16 },
    { name: "/signup", value: 8 },
  ];
  ```

1. 먼저 차트별 분류 기준을 `name`속성으로 정의해야 했습니다. (차트별로 각각 날짜, 라우팅, 시간)
2. `traffics` 배열을 순회하면서 `name`속성에 해당할 때마다 `value`값을 업데이트했습니다.
3. 이때 발생 시간의 경우 DB에 UTC 기준으로 저장을 하고 클라이언트에서 로컬 시간으로 변환해 지역별 시간 혼동을 방지했습니다.

- 결과물

  [작성 코드](https://github.com/gunhwalee/spycat-client/blob/main/src/handlers/trafficInfoHandlers.js)

<br>

## 4. 어떻게 사용자경험(UX)을 적용할까?

### 1) 슬라이드 메뉴에 UX 적용하기

- 문제점

  에러 목록 페이지에서 목록을 선택하면 선택한 에러에 대해 상세페이지가 모달 형식으로 화면 우측에 렌더링 되도록 구성했습니다.

  **참고 사이트(DATADOG)**

  <img width="450" alt="DATADOG" src="https://github.com/gunhwalee/spycat-server/assets/110829006/a95fbcb0-4769-4ab1-8f15-403c033e6587">

  하지만 실제 구현한 상세페이지는 페이지와 모달을 구분이 불분명하고 클릭과 동시에 모달이 생성되면서 사용자가 당황스러울 수 있다고 생각했습니다.

  **실제 구현 화면**

  <img width="450" src="https://github.com/gunhwalee/spycat-server/assets/110829006/08d619b0-26ac-4ed6-bc08-d3d3f8d7af6b" alt="before">

- 접근 방법

1.  모달과 페이지를 명확하게 구분하고 페이지와 상호작용이 이루어지지 않도록 구현하자.

    현재 상태는 모달이 렌더링 됐을 때 남은 여백 부분으로 보이는 페이지와 경계가 모호하고 추가적인 상호작용이 이뤄질 수 있었습니다.

    여백 부분에 음영 처리를 통해 사용자가 페이지와 모달창이 분리된 느낌을 받을 수 있도록 개선했습니다.

    모달 컨테이너 컴포넌트에 모달과 동일한 계층으로 불투명한 Canvas를 만들고 해당 Canvas가 화면 전체를 덮을 수 있도록 `position`속성을 `fixed`로 설정했습니다.  
     그리고 모달과 위치가 겹치는 부분을 해결하기 위해 `z-index`속성을 추가했습니다.

    불투명한 Canvas 덕분에 모달과 페이지가 분리되어 상호작용이 불가능하다는 느낌을 줄 수 있었습니다.

     <img width="450" alt="canvas" src="https://github.com/gunhwalee/spycat-server/assets/110829006/571e9c6e-5230-40c2-8bef-cdf9cf8e6e1c">

2.  애니메이션 효과를 적용해 보자.

    목록을 클릭했을 때 갑자기 등장하는 모달은 사용자에게 예상하지 못한 이벤트라고 생각될 수 있었습니다.  
    따라서 화면의 우측에서 슬라이드 메뉴 형식으로 자연스럽게 모달이 화면에 등장하도록 애니메이션 효과를 적용해 봤습니다.

    CSS에 존재하는 `animation`속성에는 애니메이션 효과의 지속시간을 설정할 수 있고 그 설정값에 따라 애니메이션 효과가 적용되는 전체 시간이 결정됩니다.

    하지만 모달 컴포넌트의 경우 상태 값이 `true`또는 `false`로 바뀌는 순간 `DOM`에서 해당 요소가 마운트/언마운트되기 때문에 적용 시간과의 시간 차이로 애니메이션 효과가 적용되지 않는 문제가 있었습니다.

    이를 해결하기 위해 애니메이션을 트리거하는 상태와 컴포넌트의 마운트를 트리거하는 상태를 별도로 선언해 상태 변경에 시간차를 설정했습니다.  
    이때 코드 유지 보수 측면에서 시간 값을 상수로 설정해 추후에 수정이 용이하도록 보완했습니다.

    ```js
    const [showModal, setShowModal] = useState(false);
    const [animation, setAnimation] = useState(false);

    const handleModal = () => {
      if (showModal) {
        setAnimation(false);
        setTimeout(() => {
          setShowModal(false);
        }, TIME.DETAIL_TRANSITION * 1000);
      } else {
        setAnimation(true);
        setShowModal(true);
      }
    };
    ```

    애니메이션 효과를 적용하기 위해 상태에 따라 모달 컴포넌트의 클래스가 변경되도록 구현했습니다.

    ```js
    // Modal Component
    <S.ModalContainer className={animation ? "active" : "none"}>
      <S.Wrapper>{children}</S.Wrapper>
    </S.ModalContainer>;

    // CSS
    const ModalContainer = styled.div`
      &.active {
        right: 0;
        transition: ${TIME.DETAIL_TRANSITION}s;
      }

      &.none {
        right: -50%;
        transition: ${TIME.DETAIL_TRANSITION}s;
      }
    `;
    ```

    **최종 구현 결과**

    <img width="450" src="https://github.com/gunhwalee/spycat-client/assets/110829006/07696317-cb9c-423f-8483-67cd94cc5617" alt="slide menu">

    동일한 맥락으로 드롭 다운 메뉴도 간단한 애니메이션 효과를 적용했습니다.

    <img width="150" src="https://github.com/gunhwalee/spycat-client/assets/110829006/f8352322-ca87-4b6b-93eb-2dd64064609e" alt="dropdown after">

    - 드롭 다운을 구현하면서 고민한 내용

      **마우스 호버 이벤트**

      마우스 호버 이벤트는 `mouseover`와 `mouseenter`로 나눠집니다. 두 가지 모두 마우스가 요소를 가리킬 경우 발생하지만 큰 차이점이 하나 있습니다. 바로 이벤트 버블링 유무입니다.
      `mouseover`이벤트는 이벤트 버블링이 적용되기 때문에 드롭 다운 메뉴에서 사용할 경우 새로운 하위 요소를 가리킬 때마다 이벤트다 다시 발생합니다.
      그렇게 되면 마우스로 메뉴 목록을 이동할 때마다 드롭 다운 메뉴가 다시 나타나기 때문에 이 경우엔 적절하지 않았습니다.

      **아마존 홈페이지의 메뉴를 살펴보고 느낀점**

      아마존 홈페이지의 메뉴를 살펴보면 각 메뉴에 마우스 호버 시 우측에 서브메뉴가 나옵니다. 이때 보통의 메뉴바는 우측의 서브메뉴로 마우스를 옮기는 과정에서 서브메뉴가 바뀌는 상황을 종종 보곤 했습니다.
      그런데 아마존의 메뉴는 마우스가 움직일 때 다른 메뉴에 호버가 되더라도 서브메뉴가 바뀌지 않았습니다. 사용자가 해당 메뉴를 가리키고 싶은지, 단순히 마우스를 이동하는 중인지 브라우저가 알아채기라도 하듯이 각 상황에 맞게 호버 이벤트가 발생했습니다.
      원리를 찾아 드롭다운 메뉴에도 적용하고 싶었지만 유의미한 리서치 결과를 얻지 못했습니다. 향후에 역량이 쌓인다면 꼭 도전해 보고 싶은 기능입니다.

### 2) 컴포넌트간의 로직을 공유해 보자

이렇게 구현된 드롭 다운 메뉴와 모달 컴포넌트에서 동일한 로직이 반복되는 것을 확인했습니다.  
[`React` 공식 문서](https://ko.react.dev/learn/reusing-logic-with-custom-hooks)에서 이렇게 컴포넌트 간 공통된 로직은 공유할 수 있도록 자신만의 `Custom Hook`을 작성하는 것을 권장하고 있습니다.

따라서, 두 가지의 상태와 그 상태를 트리거 하는 함수를 공통된 `Custom Hook`으로 직접 구현해 봤습니다.

```js
// useAnimation.js
function useAnimation() {
  const [showUi, setShowUi] = useState(false);
  const [animation, setAnimation] = useState(false);

  const handler = () => {
    if (showUi) {
      setAnimation(false);
      setTimeout(() => {
        setShowUi(false);
      }, TIME.DETAIL_TRANSITION * 1000);
    } else {
      setAnimation(true);
      setShowUi(true);
    }
  };

  return [showUi, animation, handler];
}

// ErrorListPage.js
const [showUi, animation, handler] = useAnimation();

return (
  ...
  {showUi && (
    <ModalBox
      closeModal={handler}
      showModal={showUi}
      error={selectedError}
      animation={animation}
    >
      <ErrorDetailPage error={selectedError} />
    </ModalBox>
  )}
)
```

### 3) 사용자가 불편한 부분을 없애보자

UX를 개선하기 위해 실제 사용 경험을 바탕으로 불편한 부분을 줄이는 것이 중요하다고 생각했습니다.
따라서 부트 캠프 동기분들께 실제로 사용해 보고 불편한 점이 무엇인지 듣고 개선 반영을 해봤습니다.

- 회원 가입, 로그인 페이지

  **뭘 적어야 하죠?**

  회원가입과 로그인 페이지처럼 사용자의 입력값을 받아야 하는 경우 무엇을 입력해야 하는지 명확한 설명이 필요했습니다.

  따라서 각 input 태그에 `focus` 이벤트가 발생했을 때 입력값에 알맞은 안내 문구를 출력했습니다.

  <img width="350" alt="input tag" src="https://github.com/gunhwalee/spycat-server/assets/110829006/a61ab517-26db-4e9d-a4be-d649e80fb6a7">

  **제가 뭘 적었죠?**

  반대로 비밀번호 같은 경우 자신이 입력한 값이 정확한지, 로그인이 실패했을 때 무엇이 틀렸는지 확인할 수 있는 방법도 필요했습니다.

  여러 웹사이트에서 볼 수 있는 형식으로 버튼을 만들고 해당 버튼이 클릭됐을 때 input 태그의 type을 일반 text로 변경해 확인할 수 있도록 구현했습니다.

  <img width="350" alt="image" src="https://github.com/gunhwalee/spycat-server/assets/110829006/a1e7c4d3-8bbd-482e-9571-fc40c0f6de54">

  **이거 되는 건가요?**

  로그인하는 과정에서 클라이언트에서 서버에 요청을 보내고 응답을 기다리는 동안 UI의 변화가 없다보니 실제 로그인 과정이 일어나고 있는지 알아채기가 어려웠습니다.

  로그인 요청을 보내는 순간 버튼을 비활성화하고 간단한 `spinner`를 구현해 사용자가 쉽게 알아볼 수 있도록 수정했습니다.

  <img width="350" src="https://github.com/gunhwalee/spycat-server/assets/110829006/b439df15-7c70-44ea-bfa2-f5d69d5ca6da" alt="login animation">

- 마이 페이지

  **이걸 다 적어야 하나요?**

  사용자가 애플리케이션에 등록한 서버마다 API KEY를 발급하고 해당 KEY를 npm 모듈의 인수로 넘겨줘야 하는 과정이 있습니다.

  사용자는 마이 페이지에서 API KEY를 확인할 수 있는데 KEY값을 일일이 받아적는 것이 불편하다고 느껴졌습니다.

  따라서 클립보드와 토스트 팝업을 설정해 버튼하나로 KEY값을 복사하고 바로 붙여넣을 수 있도록 구현했습니다.

    <img width="500" src="https://github.com/gunhwalee/spycat-server/assets/110829006/b165a2e2-a4de-433e-aaf6-554a5a6ef81a">

<br>

## 5. 클라이언트와 서버의 통신문제?

### 1) 무분별한 서버요청을 차단해 보자

- 문제점

  클라이언트에서 들어오는 요청은 클라이언트 주소에 접속한 사용자에 한해서 일어나는 일입니다.
  하지만 `npm`패키지에서 들어오는 요청은 `npm`을 사용할 줄 아는 사람이라면 누구나 요청 전송이 가능했습니다.
  또한 클라이언트 사용자는 인증 토큰을 통해 식별이 가능했지만, `npm`패키지를 사용하는 프로젝트(여기서는 함수를 호출한 사용자의 서버)를 식별할 방법이 없다는 문제도 있었습니다.

- 접근 방법

  인증과 API KEY에 대해 리서치해 보고 그 차이점을 정리해 봤습니다.

  |                            사용자 인증                            |                   API KEY                   |
  | :---------------------------------------------------------------: | :-----------------------------------------: |
  |        앱이나 사이트의 사용자를 식별 (인증/Authentication)        |      API를 호출하는 앱이나 사이트 식별      |
  | 사용자에게 요청을 위한 접근 권한 여부를 확인 (인가/Authorization) | 프로젝트가 API에 대한 접근 권한 여부를 확인 |

  따라서 사이트 사용자에게 등록한 서버마다 API KEY를 발급하고 DB의 스키마에 추가함으로써 API를 호출하는 프로젝트에 권한을 부여할 수 있었습니다.

  <img width="400" src="https://github.com/gunhwalee/spycat-client/assets/110829006/fc740342-412e-412a-bae2-48caaf2569be" alt="server list">

  발급된 키를 사용자가 `npm`패키지 함수의 인수로 넘겨주어 서버로 전송하는 요청에서 식별코자 했습니다. 하지만 일반적인 미들웨어 함수의 경우 인자로 `req`객체, `res`객체, `next`콜백 함수 세 가지를 받기 때문에 API KEY를 매개변수로 추가할 수 없었습니다.

  따라서 작성한 미들웨어 함수를 `Configurable middleware`로 수정했습니다.

  일반 매개변수를 받는 함수를 `exports`객체의 속성으로 추가하고, 매개변수를 기반으로 구현된 함수를 반환함으로써 미들웨어에 매개변수를 추가할 수 있었습니다.

  ```js
  // npm module
  exports.trafficParser = function (apikey) {
   return async function (req, res, next) {
     // Implement the middleware function based on the parameter
   };
  };

  // server.js
  ...

  app.use(trafficParser("APIKEY"));

  ...
  ```

### 2) 로그인 쿠키 문제

- 문제점

  기능 구현이 완료된 후 실제 배포를 진행하면서 로그인 과정에서 추가적인 문제도 발생했었습니다.  
  로컬 환경에서는 로그인 후 발급된 토큰이 클라이언트에 정상적으로 저장됐었지만, 프로덕션 환경에서는 쿠키에 저장되지 않는 문제점이 있었습니다.  
  로그인은 정상적으로 진행되었지만 로그인 후 발급된 토큰이 저장되지 않아 다음 요청이 인가 로직을 통과하지 못하는 것이 문제였습니다.

- 접근 방법

  우선 `Express` 공식 문서를 찾아보니 제가 설정하지 않았던 `sameSite`라는 설정이 있었습니다.  
  쿠키에서 `SameSite`속성은 HTTP Working Group이 2016년에 발표한 RFC6265에 포함된 내용으로, **쿠키를 자사 및 동일 사이트 컨텍스트로 제한해야 하는지**를 설정하는 것이었습니다.

  해당 속성은 `Strict`, `Lax`, `None` 3가지 값이 설정 가능했습니다.

  - `Strict`: 가장 보수적인 설정으로 크로스 사이트 요청에는 항상 전송되지 않습니다.
  - `Lax`: `Strict`보다 한 단계 느슨한 설정으로 Top Level Navigation(웹 페이지 이동)과 안전한 HTTP 메서드(`GET`) 요청에 한 해 크로스 사이트 요청에도 쿠키가 전송됩니다.
  - `None`: `SameSite`속성이 생기기 전 브라우저 작동 방식과 동일하게 작동되므로 동일 사이트와 크로스 사이트 모두에 쿠키 전송이 가능합니다. 이 경우 보안을 강화하기 위해 `HTTPS`프로토콜을 사용해야 하기 때문에 `Secure`속성을 함께 사용해야 합니다.

  발생한 문제의 경우 로그인 과정에서 발생한 문제로 크로스 사이트에서 `POST` 메서드를 사용하고 있었기 때문에 속성값을 `None`으로 설정해야 했습니다.

  ```js
  // 쿠키를 응답하는 로직
  res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .send(
      ... // 클라이언트로 응답할 내용
    );
  ```

  `sameSite`속성 설정 후 문제가 해결될 것이라 생각했지만 `typeError: option sameSite is invalid`라는 에러가 발생했습니다.  
  리서치 결과 다행히 `express` 버전 문제였고 버전 업데이트 후 쉽게 해결할 수 있었습니다. (`express-generator`로 생성할 경우 4.16버전이 설치되는데 해당버전에서는 `sameSite` 옵션을 지원하지 않습니다.)

# Features

- 로그인 이전 예시용 차트를 통해 대략적인 서비스 내용을 확인할 수 있습니다.
- 로그인 후 좌측의 사이드 바에서 서버를 등록할 수 있습니다.
- 사용자가 등록한 서버별 트래픽, 에러 정보를 제공합니다.
- 트래픽 차트는 오늘 기준 최근 28일의 트래픽 정보, 라우팅별 트래픽, 트래픽 발생 시간을 확인할 수 있습니다.
- 에러 차트는 오늘 기준 최근 28일의 에러 발생 정보, 라우팅별 에러, 에러 발생 시간을 확인할 수 있습니다.
- 각 차트는 날짜를 클릭해 해당 날짜에 발생한 라우팅별 정보, 발생 시간을 확인할 수 있습니다.
- 사용자는 마이페이지에서 등록된 서버를 관리할 수 있고(생성, 삭제), 서버마다 발급된 API KEY를 확인할 수 있습니다.
- API KEY는 클립보드에 복사가 가능하며, 재발급 버튼으로 재발급 받을 수 있습니다.

# Usage

- 홈페이지의 안내에 따라 회원가입, 로그인을 진행합니다.
- 로그인 후 좌측의 '서버 추가'버튼을 눌러 관리하고자 하는 서버를 등록합니다.
  - 등록할 서버의 명칭과 주소를 필수로 입력해야 합니다.
- 사용자 이름을 눌러 마이페이지로 이동하면 등록한 서버와 발급된 API KEY를 확인할 수 있습니다.
- 관리하고자 하는 서버의 소스코드에서 `spycat-tracker` 모듈을 설치합니다.
- 설치된 모듈에서 `trafficParser`와 `errorParser` 함수를 불러옵니다.
  - `const { trafficParser, errorParser } = require("spycat-tracker");`
- `trafficParser`는 라우트 분기점 위에, `errorParser`는 에러 핸들러 위에서 선언합니다.
  - `app.use(trafficParser("Your API KEY"));`
  - 이때 서버마다 발급받은 API KEY를 인수로 넘겨줍니다.
- 관리하고자 하는 서버를 실행시켜 트래픽과 에러가 정상적으로 트래킹되는지 Spy Cat 홈페이지에서 확인합니다.

**서버 등록 및 코드 세팅**
 
  <img src="https://github.com/gunhwalee/spycat-server/assets/110829006/4e8e9b6e-5e72-4fd4-9e9b-97670b150957" width="500">

**트래픽, 에러 트래킹**
 
  <img src="https://github.com/gunhwalee/spycat-server/assets/110829006/79bb4d6d-7339-498f-9b91-782a4398ee93" width="500">

# Tech Stacks

**Frontend**

- React
- Redux
- Redux Toolkit
- Styled Components

**Redux를 선택한 이유**

Redux는 하나의 저장소로 공유 상태를 관리하는 라이브러리로 애플리케이션 전반에 공통적으로 사용되는 공유 상태를 보다 수월하게 관리할 수 있습니다.  
또한 엄격한 단방향 데이터 흐름을 제공하고, 이전 상태와 액션 객체를 받아 상태를 변경하는 리듀서 함수가 순수함수로 구성되기 때문에 예측가능하고 추적하기 쉬운 상태관리를 제공해줍니다.  
이번 프로젝트의 경우 복잡한 리액트 구조와 공유 상태를 보다 쉽게 관리하기 위해 Redux를 선정했습니다.

**Backend**

- Node.js
- Express
- MongoDB
- Mongoose

**MongoDB를 선택한 이유**

MongoDB는 대표적인 비관계형 데이터베이스로 유연한 스키마 수정이 큰 장점입니다.  
프로젝트 시작 단계에서 데이터 구조를 구성하는 것 역시 매우 중요한 일이지만, 프로젝트 경험이 적은 저로서는 완벽한 데이터 구조를 구성하기 어려웠습니다.  
따라서 프로젝트를 진행하면서 중간에 데이터 구조를 변경할 경우가 발생할 것이라 예상해 MongoDB를 선정했습니다.

# Links

Live Server

- [Spy Cat](https://spycat.netlify.app)

Github Repositories

- [Frontend](https://github.com/spy-cat-0/spycat-client)
- [Backend](https://github.com/spy-cat-0/spycat-server)

# Schedule

2023.04.03 ~ 2023.04.21 : 3주

- 아이디어 기획, Mock up 작업 : 1주
- 프로젝트 개발 : 2주
