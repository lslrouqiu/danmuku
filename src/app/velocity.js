import tool from './tool';
import velocity from 'velocity-animate';

class velocityMove {
  constructor(ct, conf) {
    this.statictime = conf.statictime ? conf.statictime : 8e3; //固定弹幕时间是8秒
    this.roadNum = conf.lineheight ? conf.lineheight : 20;
    this.paddingwidth = conf.paddingwidth ? conf.paddingwidth : 0;
    this.fontsize = conf.fontsize ? conf.fontsize : '12';
    this.danmuContainer = null;
    this.enterCache = [];
    this.danmuLine = [];
    this.moveDanmu = [];
    this.enterFlag = null;
    this._init(ct);
    this.containerWidth = this.container.getBoundingClientRect().width;
    this.lineheight = this.container.getBoundingClientRect().height / this.roadNum;
    this.isPause = false;
    this._danmuEnter();
    this.transform = tool.IECheck()==9 ? '-ms-transform' : 'transform';
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
  _checkCollision() {
    let line = -1;
    for (let i = 0; i < this.roadNum; i++) {
      let danmu = this.danmuLine[i];

      if (danmu == null) {
        line = i;
        break;
      } else {
        let tween = danmu.tween;
        const pos = tween.start +  tween.duriton / danmu.runtime * tween.end
        if (pos > this.danmuLine[i].width) {
          line = i;
          break;
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
          duriton: 0,
          topPos: topPos,
          style: node.style,
          node: node,
          start: this.enterCache[i].startPostion,
          end: this.enterCache[i].width + this.containerWidth - this.enterCache[i].startPostion
        }
        this.danmuLine[topPos] = this.enterCache[i];
        fragment.appendChild(node);
      }
      this.danmuContainer.appendChild(fragment);
      this._move(this.enterCache.slice(0, i), false);
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
   *    暂停弹幕
   */
  stop() {
    this.isPause = true;
    clearTimeout(this.enterFlag);
  }

  /*
   *    重新开始弹幕运动
   */
  run() {

    this.isPause = false;
    this._move(true);
    this._danmuEnter();
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
   /*
   *    用js实现的从缓冲弹幕数组中进入界面后的移动
   */
  _clearDanmu(){
    let result = [];
    for(let i = 0,len = this.moveDanmu.length; i < len; i++){
      let danmu = this.moveDanmu[i],
          tween = danmu.tween;
      if(danmu.disabled){
        this.danmuContainer.removeChild(tween.node);
      }else{
        result.push(danmu);
      }
    }
    this.moveDanmu = result;
  }
  _move(danmus){
      for(let i = 0,len = danmus.length; i < len; i++){
        let danmu = danmus[i],
            tween = danmu.tween;
        if(danmu.disabled){
          continue;
        }
        velocity(tween.node,{
          translateX: `-${tween.end}px`
        }, {
          duration: danmu.runtime,
          complete: () => {tween.node.remove();}
        });

      }
  }

}

export default velocityMove;
