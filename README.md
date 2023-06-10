# Spy Cat

**Spy Cat**은 사용자가 보유 중인 서버의 트래픽과 에러를 시각화해주는 웹사이트입니다.  
Spy Cat에서 자신의 서버를 등록하고, 간단한 미들웨어 함수를 서버 소스코드에 추가해 다양한 정보를 쉽게 시각화된 차트로 확인할 수 있습니다.

👉[지금 바로 사용해보기](https://spycat.netlify.app)

# Table of Contents

- [Motivation](#motivation)
- [Challenges](#challenges)
  - [어떻게 서버에서 발생한 트래픽과 에러의 정보를 수집할 수 있을까?](#1-어떻게-서버에서-발생한-트래픽과-에러의-정보를-수집할-수-있을까)
    - [트래픽을 어떻게 수집할 것인가?](#1-트래픽을-어떻게-수집할-것인가)
  - [어떻게 데이터를 시각화할것인가?](#2-어떻게-데이터를-시각화할것인가)
    - [SVG vs Canvas API](#1-svg-vs-canvas-api)
    - [차트를 그릴 데이터를 어떻게 정리할까?](#2-차트를-그릴-데이터를-어떻게-정리할까)
  - [어떻게 실사용 서비스처럼 만들 수 있을까?](#3-어떻게-실사용-서비스처럼-만들-수-있을까)
    - [사용자 경험(UX)을 적용해 보자](#1-사용자-경험ux을-적용해-보자)
    - [무분별한 서버요청을 차단해 보자](#2-무분별한-서버요청을-차단해-보자)
    - [UI를 사용자 친화적으로 만들어보자](#3-ui를-사용자-친화적으로-만들어보자)
  - [클라이언트와 서버의 통신문제?](#4-클라이언트와-서버의-통신문제)
    - [CORS 문제](#1-cors-문제)
    - [로그인 쿠키 문제](#2-로그인-쿠키-문제)
- [Links](#links)
- [Tech Stacks](#tech-stacks)
- [Schedule](#schedule)

# Motivation

이번 프로젝트의 목표는 '**현재 사용할 수 있는 MERN STACK을 다듬고 잘 활용해 실제와 같은 서비스를 구현해 보자**'였습니다.

개발자로서 기술적으로 성장하는 것도 중요했지만 이번 프로젝트에서는 새로운 것을 시도하는 것보다 지금 할 수 있는 것들을 더 다듬고 개선하는 것을 중점으로 잡았습니다.

프로젝트 아이디어를 고민하던 중 New Relic에서 서비스하는 옵저버빌리티 플랫폼을 구현함으로써 그동안 배웠던 기술 스택들을 다듬고 개선할 기회라고 생각했습니다.

# Challenges

## 1. 어떻게 서버에서 발생한 트래픽과 에러의 정보를 수집할 수 있을까?

<br>

### 1) 트래픽을 어떻게 수집할 것인가?

트래픽이란 **웹사이트에 방문한 사람들이 데이터를 주고받은 양** 을 뜻합니다.

데이터를 주고받는다 함은 클라이언트의 요청에 대한 서버의 응답을 나타냅니다. 따라서 트래픽은 서버에 들어오는 요청으로 확인할 수 있었습니다. 또한 서버가 클라이언트로 부터 요청을 받을 때 항상 개별 요청으로 받기 때문에 각각의 트래픽을 감지하는 것은 어렵지 않았습니다.

1. 우선 정보를 받아올 미들웨어 함수를 작성했습니다. 클라이언트로부터 들어온 1개의 요청은 서버에서 1개의 응답이 나가야 요청-응답 주기가 종료된다는 점을 이용했습니다.

2. 작성한 미들웨어 함수에서 별도의 응답을 하지 않고, 요청 객체(`req`)에 들어있는 필요한 정보를 DB와 연결된 서버로 전송하도록 했습니다.

```js
exports.trafficParser = function (apikey) {
  return function (req, res, next) {
    axios
      .post(`https://eb-spycat.co.kr/api/servers/${apikey}/traffics`, {
        type: "traffic",
        path: req.url,
        host: req.headers.host,
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error("Error sending traffic data:", error.message);
      });

    next();
  };
};
```

그리고 각 트래픽이 분기되는 라우팅 분기점보다 위쪽에서 함수를 호출함으로써 서버에 들어온 모든 요청이 위의 미들웨어 함수를 거치도록 했습니다.

```js
app.use(trafficParser(APIKEY)); // 라우팅 분기점 위에서 요청객체의 정보를 얻고 라우팅으로 요청 객체를 넘김

app.use("/", indexRouter);
app.use("/users", usersRouter);
```

에러 정보의 경우 에러 객체를 받는 에러 처리 미들웨어 함수를 만들어 사용했습니다. 이 또한 마찬가지로 사용자 서버의 에러 핸들러 바로 위에서 함수를 호출함으로써 서버에서 발생한 에러가 미들웨어 함수를 거치도록 했습니다.

```js
app.use(errorParser(APIKEY)); // 서버의 에러핸들러 바로 위에서 에러객체의 정보를 얻고 에러핸들러로 에러 객체를 넘김

// error handler
app.use(function (err, req, res, next) {
  ...
});
```

기능 구현을 마친 뒤 추가적으로 위의 두 개의 함수를 하나로 합칠 수 있다면 사용자 편의성이 좋아질 것 같아 고민해 보았습니다.

하지만 라우팅별 분기 처리가 되기 전에 정보를 받아야 하는 트래픽과 반대로 각 분기 내에서 발생한 에러를 동시에 받을 수 있는 적절한 위치를 현재 능력으로는 찾기 어려웠습니다. 추가적인 리서치도 시도해 봤지만 큰 소득은 없었고, 해결하지 못한 부분이 아쉬웠습니다.

<br>

## 2. 어떻게 데이터를 시각화할것인가?

차트를 그리는 라이브러리는 많았지만 기술 스택을 다듬고 성장하는 과정이기에 라이브러리 없이 차트를 구현해 보고자 했습니다.

<br>

### 1) SVG vs Canvas API

리서치 결과 많은 개발자들이 차트를 구현할 때 `SVG` 또는 `Canvas API`를 사용한다는 정보를 얻었습니다. 추가적으로 둘의 장단점을 찾아보며 이번 프로젝트에 알맞은 방법이 무엇인지 고민해 봤습니다.

1. `SVG`는 `Canvas API` 보다 한층 고차원의 API로 복잡성이 상대적으로 적었습니다. 동일한 도형을 그린다는 가정하에 `SVG`를 활용하면 개발자가 작성해야 하는 코드가 훨씬 줄어들었습니다. 반면 `Canvas API`는 더 많은 유연성을 제공해 보다 다양한 도형을 그릴 수 있었습니다.

예를 들어, 동일한 원형의 도형을 그린다고 가정했을 경우 실제 코드량은 아래와 같이 차이가 있었고, 그리려는 도형이 복잡해질수록 그 차이가 더 커졌습니다.

```js
// SVG
<svg width="100" height="100">
  <circle cx="50" cy="50" r="45" fill="#FFA69E" />
</svg>;

// Canvas API
<canvas id="canvas" width="100" height="100"></canvas>;
// <script>
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#FFA69E";
ctx.arc(50, 50, 45, 0, 2 * Math.PI);
ctx.fill();
```

2. 차트에 애니메이션 효과를 추가할 경우 별도의 스크립트가 필요한 `Canvas API` 보다 `SVG`가 보다 간단하게 구현할 수 있었습니다.

위에서 그린 원에 대해 크기가 변하는 애니메이션을 적용할 경우 `SVG`는 `animate`요소를 사용해 간단하게 구현이 가능했지만, `Canvas API`는 작성해야 하는 스크립트 양이 월등히 많고 복잡했습니다.

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

이번 프로젝트의 경우 정보를 나타내는 차트로 막대형 그래프와 도넛 그래프를 구상하고 있었습니다. 그리고 각 날짜에 해당하는 그래프를 클릭했을 때 상세 그래프를 추가적으로 보여주고 싶었습니다.

이런 점들을 고려해 `SVG`가 더 적합하다고 생각했습니다. 선정한 `SVG`를 이용해 웹브라우저에서도 선명하고 간단한 애니메이션 효과를 추가한 차트를 손쉽게 구현할 수 있었습니다.

```js
<circle
  r={radius}
  cx={cx}
  cy={cy}
  fill="transparent"
  stroke={CHART_COLORS[index]}
  strokeWidth={radius / 1.5}
  strokeDasharray={`${strokeLength} ${spaceLength}`}
  strokeDashoffset={-offset}
  transform={`rotate(-90, ${cx}, ${cy})`}
>
  <animate
    attributeName="stroke-dasharray"
    from={`0 ${circumference}`}
    to={`${strokeLength} ${spaceLength}`}
    dur="1s"
    begin="0s"
    fill="freeze"
  />
  <animate
    attributeName="stroke-dashoffset"
    from="0"
    to={`${-offset}`}
    dur="1s"
    begin="0s"
    fill="freeze"
  />
</circle>
```

<img width="250" src="https://github.com/spy-cat-0/spycat-server/assets/110829006/ae47344f-85b9-4136-9cd8-aec6aa7564fa">

<br>

### 2) 차트를 그릴 데이터를 어떻게 정리할까?

`SVG`를 이용한 차트 구현이 처음이라 먼저 차트를 구현할 함수를 먼저 작성해 보고, 그 이후에 차트에 필요한 데이터 포맷을 기준으로 DB에 저장된 정보를 가공하기로 결정했습니다.

1. 먼저 `viewbox`를 정의하고 차트의 제목과 내용물 두 그룹으로 나눠 분류했습니다.

2. `viewbox`범위 내에서 막대형 그래프의 길이 비율을 조절할 수 있는 `ratio`변수를 만들었습니다.  
   `ratio`변수는 데이터 중 최댓값을 기준으로 그래프가 범위를 벗어나지 않도록 비율을 조절하는 역할을 합니다.

```js
function VerticalChart({data, width, height }) {
  const barGroups = ... // 막대차트 요소들의 묶음
  const [ratio, setRatio] = useState(8);
  const maxObjArr = data.reduce((prev, next) => {
    return prev.value >= next.value ? prev : next;
  });
  const maxValue = maxObjArr.value || 50;

  if (maxValue * ratio > height * 0.8) {
    setRatio(Math.floor(ratio * 0.75));
  } else if (maxValue * ratio < height / 2) {
    setRatio(Math.floor(ratio * 1.5));
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <text className="title" x="10" y="30">
        차트 제목
      </text>
      <g className="chart" transform="translate(80, 60)">
        {barGroups}
      </g>
    </svg>
  );
}
```

3. `barGroups`에 들어갈 막대헝차트의 컴포넌트를 추가로 작성했습니다.  
   우선 날짜를 나타내는 라벨 텍스트와 값을 나타내는 막대 모양 그리고 값을 읽을 수 있도록 텍스트까지 3개의 요소를 하나로 묶어 컴포넌트로 만들었습니다.

4. 해당 컴포넌트를 데이터의 수에 맞게 데이터 배열을 순회하면서 반환하도록 했습니다.

```js
function BarVerticalGroup(props) {
  const barPadding = 5; // 막대 그래프의 폭
  const barColor = "#348AA7"; // 그래프 색상
  const heightScale = data => data * props.ratio;
  const xMid = props.barWidth * 0.5; // 텍스트의 위치를 정해줄 변수
  const height = heightScale(props.d.value); // ratio 변수를 활용해 막대그래프의 최대높이를 설정
  const startY = 200 - height; // svg의 좌표는 좌측,상단을 기준으로 지정되지만 그래프의 경우 하단에서 시작하기 위해 별도의 변수 선언

  return (
    <g className="verticalbar-group">
      <text className="name-label" x={xMid} y="215" alignmentBaseline="middle">
        {props.data.name}
      </text>
      <rect
        x={barPadding * 0.5}
        y={startY}
        width={props.barWidth - barPadding}
        height={height}
        fill={barColor}
      />
      <text className="value-label" x={xMid} y="-10" alignmentBaseline="middle">
        {props.data.value}
      </text>
    </g>
  );
}
```

위의 컴포넌트를 이용해 차트를 그리기 위한 데이터는 이름(라벨)과 값 속성을 가진 객체로 이루어져야 했습니다. 따라서 아래와 같은 형식의 데이터를 목표로 삼았습니다.

```js
const dailyTraffics = [
  { name: 1, value: 24 },
  { name: 2, value: 11 },
  { name: 3, value: 30 },
  ...
];
```

우선 사용자가 선택한 서버에 대해 차트를 추가 구성할 때마다 DB에 데이터를 요청하는 것이 비효율적이라 생각해, 최초 1회 정보를 받아와 `global state`로 저장해두고 필요할 때마다 사용했습니다.

DB에서 아래와 같은 구조의 정보를 받아왔습니다. 여기서 트래픽 발생 시간은 서버의 지역 정보마다 time zone이 달라 혼동이 올 수 있기 때문에 UTC 형태로 DB에 저장하고, 정보를 필요로하는 클라이언트마다 로컬 시간으로 변환해서 사용하도록 했습니다.

```js
const data = [
  {
    path: "/login", // 트래픽 발생 경로
    server: ObjectId(String), // Server Document의 ID값
    createAt: 2023-06-01T05:29:44.076+00:00, // 트래픽 발생 시간
    expiredAt: 2023-06-29T05:29:44.328+00:00, // 데이터 자동삭제 시간
  },
  ...
];
```

1. 일자별 트래픽 정보를 가공하기 위해 빈 배열을 만들었습니다. 그리고 일자는 1일 ~ 31일이라는 범위가 정해져있기 때문에 각 날짜를 이름으로 갖고 값이 0인 객체를 배열에 채웠습니다.

2. `global state`에 저장되어 있는 배열 형태의 트래픽 정보를 순회하면서 날짜가 일치할 경우 `value`값을 1씩 더해줬습니다. 라우팅과 시간대별 트래픽 정보도 동일한 로직으로 진행했습니다.

```js
const dailyTraffic = [];

for (let i = 1; i < 31; i += 1) {
  dailyTraffic[i] = { name: i, value: 0 };
}

for (let i = 0; i < data.length; i += 1) {
  const date = new Date(data[i].createdAt.toString()); // UTC시간을 클라이언트 로컬시간으로 변경
  let day = String(date).slice(8, 10);

  if (day < 10) day = day.at(-1);

  for (let j = 0; j < 31; j += 1) {
    if (dailyTraffic[j].name === Number(day)) dailyTraffic[j].value += 1;
  }
}
```

<br>

## 3. 어떻게 실사용 서비스처럼 만들 수 있을까?

프로젝트 이전, 교육기간 동안은 내가 작성한 로직이 정상작동하는지에만 관심이 쏠려있었습니다. 그렇다 보니 사용자가 느끼는 불편함은 크게 고민해 본 적이 없었습니다.

그래서 프로젝트를 진행하면서 '실제 사용되는 서비스처럼 웹사이트를 구현해 보자'라는 작은 목표를 가지고 진행했습니다.

<br>

### 1) 사용자 경험(UX)을 적용해 보자

회원가입이나 로그인, 데이터 받아오기 등 클라이언트와 서버 사이의 요청-응답이 발생하는 로직의 경우 대략 1 ~ 2초 정도 응답을 기다리는 시간이 필요했습니다. 물론 1 ~ 2초는 짧은 시간이지만 사용자의 입장에서 체감해 보니 브라우저가 멈췄다는 느낌이 들법했습니다.  
따라서 사용자에게 '이 작업은 어느 정도의 시간이 필요합니다'라는 뜻을 전달해야 했습니다.

1. 서버와 요청을 주고받는 동작에 대해서는 별도의 상태를 만들어 서버에서 응답이 돌아오기 전까지 버튼을 비활성화시켜 사용자에게 현재 서버로부터 응답 대기 중이라는 신호를 나타냈습니다.

```js
// Component
const [disabled, setDisabled] = useState(false);

try {
  setDisabled(true); // 서버에 요청 보내는 순간 활성화관련 상태 변경 (버튼 비활성화)
  const response = await axios.post(
    // 서버로 요청 보내기
  );

  setDisabled(false); // 서버에서 응답이 들어오는 순간 활성화관련 상태 변경 (버튼 활성화)
  // ...
}
```

2. 추가로 비활성화된 버튼에 간단한 애니메이션을 추가해 좀 더 사실적인 환경을 제공하고자 했습니다.

```js
// Spinner Component
const SpinnerBox = styled.div`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Button
<G.Button type="submit" disabled={disabled}>
  {disabled ? <Spinner /> : "로그인"}
</G.Button>;
```

<img width="200" src="https://github.com/spy-cat-0/spycat-server/assets/110829006/3627e9ba-1b83-4ea3-ae7b-771bc48dcba0">

<br>

### 2) 무분별한 서버요청을 차단해 보자

트래픽과 에러를 수집하는 미들웨어 함수를 `npm`으로 설치해서 사용할 수 있는데, Spy Cat 서비스를 이용하는 사용자가 아니더라도 사용할 수 있었습니다. 따라서 서버의 과부하, DB의 용량 문제 등을 해결하기 위해 미들웨어 함수로부터 들어오는 요청에 대해 접근 권한을 부여해야겠다고 생각했습니다.

부트 캠프 과제를 진행하면서 `passport-github`으로 Github에서 `OAuth`를 사용했던 경험을 떠올려 Spy Cat에 회원가입을 한 사용자들에게 APIKEY를 발급하기로 했습니다.

```js
// 서버목록 생성 로직
const apikey = uuidv4(); // 생성된 서버마다 별도의 API Key 생성
const server = await Server.create({ serverName, url, apikey });
// ...
```

이렇게 사용자가 저장한 자신의 서버 목록별로 별도의 APIKEY를 발급함으로써 무분별한 서버 접근을 차단하고 요청 들어오는 데이터에 대해 서버별 분류가 훨씬 간단해졌습니다.

<br>

#### 3) UI를 사용자 친화적으로 만들어보자

이번 프로젝트에서 적용된 드롭 다운 메뉴와 슬라이드 메뉴를 사용하는 과정에서 불편함을 느낀 부분이 있었습니다. 보통 드롭 다운 메뉴의 경우 불리언 값을 나타내는 상태를 생성하고, 마우스 이벤트(클릭 또는 호버)에 상태를 업데이트해 드롭 다운 메뉴를 마운트, 언마운트하는 방식으로 사용합니다.

여기서 `mouseenter` 혹은 `mouseleave` 이벤트가 발생할 때 해당 컴포넌트 요소가 바로 화면에 나타나거나 사라지기 때문에 사용자가 원치 않는 메뉴에 마우스가 호버 되는 상황이 종종 발생했습니다.

<img width="340" alt="스크린샷 2023-06-06 오후 9 24 45" src="https://github.com/spy-cat-0/spycat-client/assets/110829006/18d0cfd1-ae1f-4828-831e-1cc97de8be97">

이런 문제를 해결하고자 애니메이션 효과를 추가했습니다. 처음에 CSS에 `animation`속성을 추가했지만 적용이 되지 않았습니다. 상태 값이 `true`에서 `false`로 바뀌는 순간 애니메이션이 적용돼야 하지만 `DOM`에서 해당 요소가 언마운트되다 보니 애니메이션이 적용되지 않고 곧바로 사라지는 현상이 있었습니다.

이를 해결하기 위해 애니메이션을 트리거 할 수 있는 상태와 컴포넌트를 마운트하는 상태를 별도로 만들어 문제를 해결했습니다.

```js
// Component
const [showDrop, setShowDrop] = useState(false);
const [animation, setAnimation] = useState(false); // 애니메이션과 마운트를 관리하는 상태를 별도로 선언

const mouseHandler = () => {
  if (showDrop) {
    setAnimation(false);
    setTimeout(() => {
      setShowDrop(false);
    }, TIME.SIDE_DROPDOWN * 1000); // 컴포넌트가 언마운트 되는 시점을 애니메이션이 진행되는 시간만큼 뒤로 미뤄서 진행
  } else {
    setAnimation(true);
    setShowDrop(true);
  }
};
...
{showDrop && (
  ...
  <S.DropDown className={animation ? "active" : "none"}>
  ...
)} // animation상태를 기준으로 요소의 class를 별도로 설정

// CSS
&.none {
  animation: dropup ${TIME.SIDE_DROPDOWN}s ease;
  animation-fill-mode: forwards;
  @keyframes dropup {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-100%);
    }
  }
}

&.active {
  animation: dropdown ${TIME.SIDE_DROPDOWN}s ease;
  @keyframes dropdown {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(0);
    }
  }
}
```

<img width="150" src="https://github.com/spy-cat-0/spycat-server/assets/110829006/ad1ead57-c3a5-421f-80b9-59730a3971e3">

<br>

## 4. 클라이언트와 서버의 통신문제?

부트 캠프 교육기간 동안은 모놀리스구조로 작업을 했었습니다. 그렇다 보니 클라이언트와 서버 간의 요청을 주고받는 상황에서 큰 어려움이 없었습니다.

이번 프로젝트에서는 클라이언트와 서버를 별도로 구성해 작업을 했다 보니 간단한 클라이언트와 서버 간 통신에서 여러 가지 문제를 경험할 수 있었습니다.

<br>

### 1) CORS 문제

프로젝트 이전에 CORS 문제를 직접 경험해 보지는 못했지만, 그 개념과 해결 방법에 대해서는 사전에 조사를 해두었습니다. 그리고 실제로 해결 방법을 적용하는 것도 어렵지 않았습니다.

서버와 클라이언트의 출처가 다르기 때문에 CORS 문제를 해결하기 위해서 서버에서 응답 헤더에 Access-Control값을 설정해야했습니다. 직접 응답 객체에 `setHeader` 메서드를 이용해 허용 출처를 설정할 수도 있지만, 저는 좀 더 간편한 `cors`모듈을 사용해 설정했습니다.

```js
const cors = require("cors");
...
app.use(cors({
  origin: 클라이언트 출처 // 접근 권한을 부여할 도메인
  credentials: true // 클라이언트와 서버 간에 쿠키를 주고받도록 허용
}));
```

<br>

### 2) 로그인 쿠키 문제

기능 구현이 완료된 후 실제 배포를 진행하면서 로그인 과정에서 추가적인 문제도 발생했었습니다. 로컬 환경에서는 로그인 과정에서 발급된 토큰이 클라이언트에 정상적으로 저장됐었습니다.

하지만 프로덕션 환경에서는 로그인 후 토큰이 쿠키에 저장되지 않는 문제점이 있었습니다. 로그인은 정상적으로 진행되었지만 로그인 후 발급된 토큰이 저장되지 않아 다음 요청이 인가 로직을 통과하지 못하는 것이 문제였습니다.

우선 `Express` 공식 문서를 찾아보니 제가 설정하지 않았던 `sameSite`라는 설정이 있었습니다. 쿠키에서 `SameSite`속성은 HTTP Working Group이 2016년에 발표한 RFC6265에 포함된 내용으로, **쿠키를 자사 및 동일 사이트 컨텍스트로 제한해야 하는지**를 설정하는 것이었습니다. 해당 속성은 `Strict`, `Lax`, `None` 3가지 값이 설정 가능했습니다.

- `Strict`: 가장 보수적인 설정으로 크로스 사이트 요청에는 항상 전송되지 않습니다.
- `Lax`: `Strict`보다 한 단계 느슨한 설정으로 Top Level Navigation(웹 페이지 이동)과 안전한 HTTP 메서드(`GET`) 요청에 한 해 크로스 사이트 요청에도 쿠키가 전송됩니다.
- `None`: `SameSite`속성이 생기기 전 브라우저 작동 방식과 동일하게 작동됩니다.

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

`sameSite`속성 설정 후 문제가 해결될 것이라 생각했지만 이번에는 `typeError: option sameSite is invalid`라는 에러가 발생했습니다. 리서치 결과 다행히 `express` 버전 문제였고 버전 업데이트 후 쉽게 해결할 수 있었습니다. (`express-generator`로 생성할 경우 4.16버전이 설치되는데 해당버전에서는 `sameSite` 옵션을 지원하지 않습니다.)

# Links

Deploy

- [Spy Cat](https://spycat.netlify.app)

Github Repositories

- [Frontend](https://github.com/spy-cat-0/spycat-client)
- [Backend](https://github.com/spy-cat-0/spycat-server)

# Tech Stacks

Frontend

- React
- Redux
- Redux Toolkit
- Styled Components

Backend

- Node.js
- Express
- MongoDB
- Mongoose

# Schedule

2023.04.03 ~ 2023.04.21 : 3주

- 아이디어 기획, Mock up 작업 : 1주
- 프로젝트 개발 : 2주
