import tool from './tool';

class canvas {
  constructor(ct,conf){
    this.statictime = conf.statictime ? conf.statictime : 8e3; //固定弹幕时间是8秒
    this.roadNum = conf.lineheight ? conf.lineheight : 20;
    this.paddingwidth = conf.paddingwidth ? conf.paddingwidth : 0;
    this.fontsize = conf.fontsize ? conf.fontsize : '12';
    this.moveDanmu = [];
    this.enterCache = [];
    this.danmuLine = [];
    this.isPause = false;
    this._initCotainer(ct);
    this.containerWidth = this.container.getBoundingClientRect().width;
    this.containerHeight = this.container.getBoundingClientRect().height;
    this.lineheight = this.containerHeight / this.roadNum;
    this._setContainer();
    this._canvasDanmuEnter();
    this._initCanvas();
  }
  _initCotainer(ct){
    if (typeof ct === 'string') {
      this.container = document.querySelector(ct);
    } else {
      this.container = ct;
    }
  }
  _setContainer() {
    this.canvascontainer = document.createElement('canvas');
    tool.css(this.canvascontainer, {
      'position': 'absolute',
      'top': 0,
      'left': 0,
    });
    this.canvascontainer.setAttribute('width', this.containerWidth);
    this.canvascontainer.setAttribute('height', this.containerHeight);

    this.container.appendChild(this.canvascontainer);
  }
  _initCanvas(){
    let context = this.canvascontainer.getContext('2d');
    this._canvasMove(context);
  }
  /*
   *    缓冲区弹幕创建
   */
  _canvasDanmuEnter(){
    this.enterFlag = setTimeout(() => {
      let i = 0;
      for(let len = this.enterCache.length; i < len; i++){
        let danmu = this.enterCache[i];
        let topPos = this._checkCollision();
        if(topPos == -1){
          break;
        }
        this._initCanvasDanmu(danmu,topPos);
        this.danmuLine[topPos] = danmu;
      }

      this.moveDanmu = this.moveDanmu.concat(this.enterCache.slice(0,i));
      this.enterCache.splice(0,i);
      this._canvasDanmuEnter();
    }, 1000);
  }
  _checkCollision(){
    const containerW = this.containerWidth;
    let line = -1;
    for(let i = 0;i < this.roadNum;i++){
      if(this.danmuLine[i] == null){
        line = i;
        break;
      }else{
        if(this.danmuLine[i].move){
          const position = containerW - this.danmuLine[i].x;
          if(position > this.danmuLine[i].width){
            line = i;
            break;
          }
        }
      }
    }
    return line;
  }
   /*
   *    发送弹幕
   */
  emit(_cmt) {
    if (!_cmt.content || !_cmt.html) {
      return;
    }
    let danmu = this._createDanmu(_cmt);
    this.enterCache.push(danmu);
  }

  /*
   *    暂停弹幕
   */
  stop(){
      this.isPause = true;
      clearTimeout(this.enterFlag);
  }

  /*
   *    重新开始弹幕运动
   */
  run(){
      this._canvasDanmuEnter();
      this.isPause = false;
      this._canvasMove(this.canvascontainer.getContext('2d'));
  }
    /*
   *    处理弹幕数据
   */
  _createDanmu(obj) {
    let danmu = new Object();
    danmu.fontsize = obj.fontsize ? obj.fontsize : this.fontsize;
    danmu.paddingwidth = obj.paddingwidth ? obj.paddingwidth : this.paddingwidth;
    danmu.startPostion = obj.startPostion ? obj.startPostion : 0;
    danmu.content = obj.content;
    danmu.width = tool.getContentWidth(danmu);
    danmu.runtime = obj.runtime ? obj.runtime : this.statictime;
    danmu.speed = (danmu.width + this.containerWidth) / danmu.runtime;
    danmu.color = '#fff';
    return danmu;
  }
   /*
   *    canvas弹幕初始化
   */
  _initCanvasDanmu(danmu,topPos){
    danmu.x = this.containerWidth;
    danmu.y = (topPos +1) * this.lineheight;
    danmu.canvasTime = Date.now();
    danmu.move = true;
  }
  /*
   *    canvas弹幕移动
   */
  _drawCanvasNode(context,danmu){
    if(!danmu.content){
      return;
    }
    context.font = danmu.fontsize + 'px "microsoft yahei", sans-serif';
    context.fillStyle = danmu.color;

    context.fillText(danmu.content, danmu.x, danmu.y);
  }

  _canvasDraw(context){
    if(this.moveDanmu.length > 100){
      this._clearDanmu();
    }
    for (let i = 0,len = this.moveDanmu.length; i < len; i++) {
      let danmu = this.moveDanmu[i];
      if (danmu && !danmu.disabled) {
        danmu.x -= 16 * danmu.speed;
        if (danmu.x < -1 * danmu.width) {
          danmu.disabled = true;
        }
        this._drawCanvasNode(context,danmu);
      }
    }
  }

  _canvasMove(context){
    const width = this.containerWidth;
    const height = this.containerHeight;
    let _this = this;
    let tick = function(){
      context.clearRect(0, 0, width, height);
      _this._canvasDraw.call(_this,context);
      if (_this.isPause == false) {
        requestAnimationFrame(tick);
      }
    }
    tick()
  }
  _clearDanmu(){
    this.moveDanmu = this.moveDanmu.filter(danmu => danmu.disabled != true);
  }
}

export default canvas;
