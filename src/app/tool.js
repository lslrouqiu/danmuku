export default {

  Type:{
    isString: function(variable) {
      return (typeof variable === "string");
    },
  },

  addClass(element,className) {
    if (element) {
      if (element.classList) {
        element.classList.add(className);
      } else if (this.Type.isString(element.className)) {
        //Element.className 比set/getAttribute要快 15%
        element.className += (element.className.length ? " " : "") + className;
      } else {
        let currentClass = element.getAttribute("class") || "";
        element.setAttribute("class", currentClass + (currentClass ? " " : "") + className);
      }
    }
  },
  removeClass: function(element, className) {
    if (element) {
      if (element.classList) {
        element.classList.remove(className);
      } else if (Type.isString(element.className)) {
        element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
      } else {
        const currentClass = element.getAttribute("class") || "";
        element.setAttribute("class", currentClass.replace(new RegExp("(^|\s)" + className.split(" ").join("|") + "(\s|$)", "gi"), " "));
      }
    }
  },
  /*
 *   给元素设置样式
 */

  css(el, cssobj) {
    if (!el || !el.style) {
      return;
    }
    Object.keys(cssobj).forEach(function(k) {
      el.style[k] = cssobj[k];
    });
  },

  getContentWidth(danmu) {
    let txtwidth = parseInt(this.getTxtWidth(danmu.content) * danmu.fontsize);  //转个整数
    let width = txtwidth + danmu.paddingwidth;
    return width;
  },
  getTxtWidth(str) {
    let strlen = 0;
    if(str.length > 0) {
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
          strlen += 1; //如果是汉字，则字符串长度加2
        }else {
          strlen += 0.61;
        }
      }
    }
    return strlen;
  },
  IECheck(){
    const sUserAgent = navigator.userAgent;
    const isOpera = sUserAgent.indexOf("Opera") > -1;
    const isIE = sUserAgent.indexOf("compatible") > -1 && sUserAgent.indexOf("MSIE") > -1 && !isOpera;
    let version = undefined;
    if (isIE) {
      let reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(sUserAgent);
      version = parseFloat(RegExp['$1']);
    }
    return version;
  }
}
