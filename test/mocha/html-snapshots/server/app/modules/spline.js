define([
  "app"
],
function (app) {
  var module = app.module();

  var hexToCanvasColor = function (hexColor,opacity) {
    // Convert #AA77CC to rbga() format for Firefox
    opacity=opacity || "1.0";
    hexColor=hexColor.replace("#","");
    var r=parseInt(hexColor.substring(0,2),16);
    var g=parseInt(hexColor.substring(2,4),16);
    var b=parseInt(hexColor.substring(4,6),16);
    return "rgba("+r+","+g+","+b+","+opacity+")";
  };

  var drawPoint = function (ctx,x,y,r,color) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.fillStyle=hexToCanvasColor(color,1);
    ctx.arc(x,y,r,0.0,2*Math.PI,false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };

  var getControlPoints = function (x0,y0,x1,y1,x2,y2,t) {
    //  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
    //  x2,y2 is the next knot -- not connected here but needed to calculate p2
    //  p1 is the control point calculated here, from x1 back toward x0.
    //  p2 is the next control point, calculated here and returned to become the 
    //  next segment's p1.
    //  t is the 'tension' which controls how far the control points spread.

    //  Scaling factors: distances from this knot to the previous and following knots.
    var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
    var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));

    var fa=t*d01/(d01+d12);
    var fb=t-fa;

    var p1x=x1+fa*(x0-x2);
    var p1y=y1+fa*(y0-y2);

    var p2x=x1-fb*(x0-x2);
    var p2y=y1-fb*(y0-y2);

    return [p1x,p1y,p2x,p2y];
  };

  var drawControlLine = function (ctx,x,y,px,py) {
    //  Only for demo purposes: show the control line and control points.
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.strokeStyle="rgba(0,0,0,0.3)";
    ctx.moveTo(x,y);
    ctx.lineTo(px,py);
    ctx.closePath();
    ctx.stroke();
    drawPoint(ctx,px,py,1.5,"#000000");
    ctx.restore();
  };

  // context, points, tension, linewidth, color
  module.draw = function(ctx,pts,t,lw,cl) {

    var closed = false,
        showDetails = false,
        cp = [];   // array of control points, as x0,y0,x1,y1,...
        n = pts.length,
        i = 0;

    ctx.lineWidth=lw;
    ctx.save();

    // Draw an open curve, not connected at the ends
    for (i=0; i < n-4; i+=2) {
      cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5],t));
    }
    for(i=2; i < pts.length-5; i+=2) {
      ctx.strokeStyle=hexToCanvasColor(cl,0.75);
      ctx.beginPath();
      ctx.moveTo(pts[i],pts[i+1]);
      ctx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
      ctx.stroke();
      ctx.closePath();
      if(showDetails){
          drawControlLine(ctx,pts[i],pts[i+1],cp[2*i-2],cp[2*i-1]);
          drawControlLine(ctx,pts[i+2],pts[i+3],cp[2*i],cp[2*i+1]);
      }
    }

    //  For open curves the first and last arcs are simple quadratics.
    ctx.strokeStyle=hexToCanvasColor(cl,0.75);
    ctx.beginPath();
    ctx.moveTo(pts[0],pts[1]);
    ctx.quadraticCurveTo(cp[0],cp[1],pts[2],pts[3]);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle=hexToCanvasColor(cl,0.75);
    ctx.beginPath();
    ctx.moveTo(pts[n-2],pts[n-1]);
    ctx.quadraticCurveTo(cp[2*n-10],cp[2*n-9],pts[n-4],pts[n-3]);
    ctx.stroke();
    ctx.closePath();
    if(showDetails){
      drawControlLine(ctx,pts[2],pts[3],cp[0],cp[1]);
      drawControlLine(ctx,pts[n-4],pts[n-3],cp[2*n-10],cp[2*n-9]);
    }

    ctx.restore();

    if(showDetails){   //   Draw the knot points.
      for(i=0; i < n; i+=2){
        drawPoint(ctx,pts[i],pts[i+1],2.5,"#ffff00");
      }
    }
  };

  return module;
});