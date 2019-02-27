// 插件开发的时候 这个是入口文件
import raf from './raf';
import translate from './translate';
import transition from './transition';
import canvas from './canvas';
import webAnimation from './webAnimaiton';
import velocityMove from './velocity';

function create(ct, type, conf) {
  raf();
  if (!conf) {
    conf = {};
  }
  if (!type) {
    type = 0;
  }
  console.log(type);
  if (type === 0) {
    return new translate(ct, conf);
  } else if (type === 1) {
    return new transition(ct, conf);
  } else if (type === 2) {
    return new canvas(ct, conf);
  } else if (type ===3 ){
    return new webAnimation(ct,conf);
  } else if (type ===4 ){
    return new velocityMove(ct,conf);
  }else {
    alert('type只能为0,1,2,3,4！');
  }
}

export default create;
