

var img = new Image();   // 创建一个<img>元素
// 获取canvas
let canvas = document.getElementById("canvas");
const open = document.querySelector('.open')
const select = document.querySelector('.select')
const set = document.querySelector('.set')
const options = document.querySelector('.options')
const exportCanvas = document.querySelector('.exportCanvas')
const clear = document.querySelector('.clear')
window.onclick = (e) => {
  if (e.target === open) {
    options.style.display = 'none'
    select.style.display = 'flex'
    return
  }
  if (e.target === set) {
    select.style.display = 'none'
    options.style.display = 'flex'
    return
  }
  select.style.display = 'none'
  options.style.display = 'none'
}

const color = ['#ff5252', '#000', '#00c853', '#00b0ff']
const point = [5, 10, 12, 15, 20]



CanvasRenderingContext2D.prototype.clearArc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
  this.beginPath();
  this.globalCompositeOperation = 'destination-out';
  this.fillStyle = 'black';
  this.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  // 参数分别是：圆心横坐标、纵坐标、半径、开始的角度、结束的角度、是否逆时针
  this.fill();
  this.closePath();
};
//获取这个元素的context——图像稍后将在此被渲染。
const ctx = canvas.getContext('2d') //建立一个 CanvasRenderingContext2D 二维渲染上下文。

//获取当前文档
canvas.width = document.documentElement.clientWidth * window.devicePixelRatio;
canvas.height = document.documentElement.clientHeight * window.devicePixelRatio;
canvas.style.width = document.documentElement.clientWidth + "px";
canvas.style.height = document.documentElement.clientHeight + "px";


const canvasOptions = {
  strokeStyle: 'rgb(246,55,64)',
  lineWidth: 10,
  lineJoin: 'round',
  lineCap: 'round',
  scaleX: window.devicePixelRatio,
  scaleY: window.devicePixelRatio
}

const data = {
  isPaint: false,// 绘制状态
  beginPoint: { x: null, y: null },//起始点
  controlPoint: { x: null, y: null },//控制点
  endPoint: { x: null, y: null },//结束点
  pointsArr: []//贝塞尔曲线需要计算的点
}

//绘制
//设置画笔宽度
ctx.strokeStyle = canvasOptions.strokeStyle
ctx.lineWidth = canvasOptions.lineWidth
ctx.lineJoin = canvasOptions.lineJoin
ctx.lineCap = canvasOptions.lineCap
// 根据 x 水平方向和 y 垂直方向，为canvas 单位添加缩放变换,消除锯齿
ctx.scale(canvasOptions.scaleX, canvasOptions.scaleY);

select.onclick = (e) => {
  if (e.target.dataset.color) {
    ctx.strokeStyle = e.target.dataset.color
  }
  if (e.target.dataset.size) {
    ctx.lineWidth = parseInt(e.target.dataset.size)
  }
}

// 判断是否移动设备
let isPhone = "ontouchstart" in document.documentElement;
if (!isPhone) {
  canvas.onmousedown = (e) => {
    data.isPaint = true
    pushPoint(e)
    data.beginPoint = {
      x: e.clientX,
      y: e.clientY
    }
  }
  canvas.onmousemove = (e) => {

    if (!data.isPaint) return;
    pushPoint(e)
    if (data.pointsArr.length >= 3) {
      //得到控制点
      getPoint('mousemove')
      paint(data.beginPoint, data.controlPoint, data.endPoint).then(() => {
        data.beginPoint = data.endPoint;
      })
    }
  }
  canvas.onmouseup = (e) => {
    pushPoint(e)
    if (data.pointsArr.length >= 3) {
      getPoint('mouseup')
      //绘制
      paint(data.beginPoint, data.controlPoint, data.endPoint).then(() => {
        arr.push(ctx)
        data.isPaint = false
        data.beginPath = null
        data.pointsArr = []
      })

    }

  }
} else {
  canvas.ontouchstart = (e) => {
    data.isPaint = true
    pushPoint(e)
    data.beginPoint = {
      x: e.clientX,
      y: e.clientY
    }
  }
  canvas.ontouchmove = (e) => {

    if (!data.isPaint) return;
    pushPoint(e)
    if (data.pointsArr.length >= 3) {
      //得到控制点
      getPoint('mousemove')
      paint(data.beginPoint, data.controlPoint, data.endPoint).then(() => {
        data.beginPoint = data.endPoint;
      })
    }
  }
  canvas.ontouchend = (e) => {
    pushPoint(e)
    if (data.pointsArr.length >= 3) {
      getPoint('mouseup')
      //绘制
      paint(data.beginPoint, data.controlPoint, data.endPoint).then(() => {
        arr.push(ctx)
        data.isPaint = false
        data.beginPath = null
        data.pointsArr = []
      })

    }

  }
}


var arr = []


const pushPoint = (e) => {
  data.pointsArr.push({
    x: e.clientX,
    y: e.clientY
  })
}
const getPoint = (stage) => {
  if (stage === 'mousemove') {
    //得到控制点
    let controlAndEnd = data.pointsArr.slice(-2)
    data.controlPoint = controlAndEnd[0]
    //计算出结束点
    data.endPoint = {
      x: (controlAndEnd[0].x + controlAndEnd[1].x) / 2,
      y: (controlAndEnd[0].y + controlAndEnd[1].y) / 2,
    }
    return
  }
  //mouseup
  //得到控制点
  let controlAndEnd = data.pointsArr.slice(-2)
  data.controlPoint = controlAndEnd[0]
  //计算出结束点
  data.endPoint = controlAndEnd[1]
}
function paint(beginPoint, controlPoint, endPoint) {
  return new Promise((reslove) => {
    //绘制线段
    ctx.beginPath();
    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    ctx.stroke();
    reslove()
  })
}



/*
 
橡皮檫
 
*/

let eraser = document.querySelector('.eraser')

eraser.onclick = (e) => {
  canvas.addEventListener('mousemove', function (e) {
    ctx.clearArc(e.clientX, e.clientY, 10, 10);
  })
}

//导出
exportCanvas.onclick = () => {
  var fullQuality = canvas.toDataURL("image/png", 1.0);
  var dlLink = document.createElement('a');
  dlLink.download = new Date().getDate()
  dlLink.href = fullQuality;
  dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');

  document.body.appendChild(dlLink);
  dlLink.click();
  document.body.removeChild(dlLink);
}

//清空
clear.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}