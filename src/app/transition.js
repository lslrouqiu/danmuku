import tool from './tool'
class transition {
  constructor(ct, conf) {
    this.statictime = conf.statictime ? conf.statictime : 8e3; //固定弹幕时间是8秒
    this.roadNum = conf.lineheight ? conf.lineheight : 20;
    this.paddingwidth = conf.paddingwidth ? conf.paddingwidth : 0;
    this.fontsize = conf.fontsize ? conf.fontsize : '12';
    this.danmuContainer = null;
    this.enterCache = [];
    this.danmuLine = [];
    this.enterFlag = null;
    this._init(ct);
    this.containerWidth = this.container.getBoundingClientRect().width;
    this.lineheight = this.container.getBoundingClientRect().height / this.roadNum;
    this._danmuEnter();
  }
  //初始化弹幕容器
  _init(ct) {
    if (typeof ct === 'string') {
      this.container = document.querySelector(ct);
    } else {
      this.container = ct;
    }
    this.danmuContainer = document.createElement('div');
    tool.css(this.continer, {
      'position': 'relative'
    });
    tool.css(this.danmuContainer, {
      'position': 'absolute',
      'top': 0,
      'left': 0,
      'width': '100%',
      'height': '100%',
      'overflow': 'hidden'

    });
    this.container.appendChild(this.danmuContainer);
  }
   /*
   *    碰撞检测
   */
  _checkCollision(){
    let line = -1;
    for(let i = 0;i < this.roadNum;i++){
      if(this.danmuLine[i] == null){
        line = i;
        break;
      }else{
        if(this.danmuLine[i].move){
          const position = this.danmuLine[i].tween.start + (Date.now() - this.danmuLine[i].tween.startTime) * this.danmuLine[i].speed;
          if(position > this.danmuLine[i].width){
            line = i;
            break;
          }
        }
      }
    }
    return line;
  }
  _danmuEnter() {
    this.enterFlag = setTimeout(() => {
      let fragment = document.createDocumentFragment();
      let i = 0;
      for (let len = this.enterCache.length; i < len; i++) {
        let topPos = this._checkCollision();
        if (topPos == -1) {
          break;
        }
        let node = this._buildNode(this.enterCache[i], topPos);
        this.enterCache[i].tween = {
          startTime: 0,
          topPos: topPos,
          node: node,
          start: this.enterCache[i].startPostion,
          end: this.enterCache[i].width + this.containerWidth,
        }
        this.danmuLine[topPos] = this.enterCache[i];
        fragment.appendChild(node);
      }
      this.danmuContainer.appendChild(fragment);
      this._transitionMove(this.enterCache.slice(0,i));
      this.enterCache.splice(0, i);
      this._danmuEnter();
    }, 1000);
  }
  //发送弹幕
  emit(conf) {
    if (!conf.content || !conf.html) {
      return;
    }
    let danmu = this._createDanmu(conf);
    this.enterCache.push(danmu);
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
    danmu.html = obj.html;
    danmu.width = tool.getContentWidth(danmu);
    danmu.runtime = obj.runtime ? obj.runtime : this.statictime;
    danmu.speed = (danmu.width + this.containerWidth) / danmu.runtime;

    return danmu;
  }
  /*
   *    创建弹幕节点
   */
  _buildNode(danmu, topPos) {
    let $node = document.createElement('div');
    tool.addClass($node, 'danmu-ct');
    $node.innerHTML = danmu.html;
    tool.css($node, {
      'position': 'absolute',
      'left': '100%',
      'top': this.lineheight * topPos + 'px',
      'font-size': danmu.fontsize + 'px',
      'white-space': 'nowrap',
      'transform': `translateX(${danmu.startPostion}px)`
    })
    return $node;
  }
  _transitionMove(danmus){
    setTimeout(() => {
      for(let i = 0;i < danmus.length;i++){
        danmus[i].move = true;
        danmus[i].tween.startTime = Date.now();
        const time = danmus[i].runtime/1000;
        tool.css(danmus[i].tween.node,{
          'transition': 'transform ' + time + 's linear',
          '-webkit-transition': '-webkit-transform ' + time + 's linear',
          '-moz-transition': '-moz-transform ' + time + 's linear',
          '-ms-transition': '-ms-transform ' + time + 's linear',
          'transform': 'translateX(-' + danmus[i].tween.end + 'px)',
          '-webkit-transform': 'translateX(-' + danmus[i].tween.end + 'px)',
          '-ms-transform': 'translateX(-' + danmus[i].tween.end + 'px)',
          '-moz-transform': 'translateX(-' + danmus[i].tween.end + 'px)'
        })
        setTimeout(() => {
          this.danmuContainer.removeChild(danmus[i].tween.node);
          if(this.danmuLine[danmus[i].tween.topPos].tween.node == danmus[i].tween.node){
            this.danmuLine[danmus[i].tween.topPos] = null;
          }
        }, danmus[i].runtime);
      }
    }, 50);
  }
}

export default transition;
