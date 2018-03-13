
var list = document.getElementById("map-pos-list");
var map;
var isUpdateList = true;
var addressSection ;
 AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
   map = new AMap.Map('container',{
     zoom:16,
     scrollWheel: false
   });

   //输入提示
   var autoOptions = {
       input: "search"
   };
   var auto = new AMap.Autocomplete(autoOptions);
   var placeSearch = new AMap.PlaceSearch({
       map: map
   });  //构造地点查询类
   AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
   function select(e) {
       placeSearch.setCity(e.poi.adcode);
       placeSearch.search(e.poi.name,function(status,result){

         var poi = result.poiList.pois[0];
         lng = poi.entr_location.lng;
         lat = poi.entr_location.lat;
         lnglat = new AMap.LngLat(lng,lat);
         map.setCenter(lnglat);
         //console.log(poi);
       });  //关键字查询查询
   }


   AMap.plugin('AMap.Geolocation', function () {
       geolocation = new AMap.Geolocation({
           enableHighAccuracy: true,//是否使用高精度定位，默认:true
           timeout: 10000,          //超过10秒后停止定位，默认：无穷大
           maximumAge: 0,           //定位结果缓存0毫秒，默认：0
           convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
           showButton: true,        //显示定位按钮，默认：true
           buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
           buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
           showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
           showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
           panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
           zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
       });
       map.addControl(geolocation);
       geolocation.getCurrentPosition();
   });

     positionPicker = new PositionPicker({
         mode: 'dragMap',
         map: map
     });
     positionPicker.on('success', function(positionResult) {
       if(isUpdateList){
         var lng = positionResult.position.lng;
         var lat = positionResult.position.lat;
         //var address = getAddress(positionResult);
         list.innerHTML = '';

         var html = '<li class="map-pos-item" onclick="selectAddress(this,\''+lng+'\',\''+lat+'\')" >'+
                    '<div class="map-pos-item-name map-active">[位置]</div>'+
                    '<span class="map-pos-item-address map-active">'+positionResult.regeocode.formattedAddress+'</span>'+
                    '</li>';
        localStorage.address = positionResult.regeocode.formattedAddress;
        list.innerHTML = html;
        geocoder(lng,lat);
         //console.log(lng,lat);
       }
       isUpdateList = true;
     });
     positionPicker.on('fail', function(positionResult) {

     });
     onModeChange = function(e) {
         positionPicker.setMode(e.target.value)
     }

     positionPicker.start();

 });
//逆向地理解析
 function geocoder(lng,lat) {
     var lnglatXY = new AMap.LngLat(lng,lat);
     //加载地理编码插件
     map.plugin(["AMap.Geocoder"], function() {
         MGeocoder = new AMap.Geocoder({
             radius: 1000,
             extensions: "all"
         });
         //返回地理编码结果
         AMap.event.addListener(MGeocoder, "complete", geocoder_CallBack);
         //逆地理编码
       MGeocoder.getAddress(lnglatXY);
     });
 }

function geocoder_CallBack(data){
  var html = '';
  addressSection = data.regeocode.addressComponent.province+data.regeocode.addressComponent.city+data.regeocode.addressComponent.district;
  //console.log(address);
  for(var i=0;i<data.regeocode.pois.length;i++){
    //console.log(data.regeocode.pois[i].name);
    html += '<li class="map-pos-item" onclick="selectAddress(this,\''+data.regeocode.pois[i].location.lng+'\',\''+data.regeocode.pois[i].location.lat+'\')">'+
            '<div class="map-pos-item-name">'+data.regeocode.pois[i].name+'</div>'+
            '<span class="map-pos-item-address">'+addressSection+data.regeocode.pois[i].address+'</span>'+
            '</li>';
  }
  list.innerHTML +=html;
}

function selectAddress(obj,lng,lat){
  var active = document.getElementsByClassName("map-active");
  for(var i=0;i<2;i++){
    active[0].className = active[0].className.replace("map-active",'');
  }
  var itemName = obj.getElementsByClassName("map-pos-item-name")[0];
  var itemAddress = obj.getElementsByClassName("map-pos-item-address")[0];
  itemName.className += " map-active" ;
  itemAddress.className += " map-active" ;
  localStorage.address = itemName.innerHTML=="[位置]"?itemAddress.innerHTML : addressSection+itemName.innerHTML;
  console.log(localStorage.address);
  isUpdateList = false;
  lnglat = new AMap.LngLat(lng,lat);
  map.setCenter(lnglat);
}
//返回详细地址
 function getAddress(positionResult){
   return positionResult.regeocode.addressComponent.province+positionResult.regeocode.addressComponent.city+positionResult.regeocode.addressComponent.district+positionResult.regeocode.addressComponent.street+positionResult.regeocode.addressComponent.township+positionResult.regeocode.addressComponent.streetNumber;
 }

 function hasClass(elem, cls) {
   cls = cls || '';
   if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
   return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
 }

 function addClass(ele, cls) {
   if (!hasClass(elem, cls)) {
     ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
   }
 }

 function removeClass(ele, cls) {
   if (hasClass(elem, cls)) {
     var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
     while (newClass.indexOf(' ' + cls + ' ') >= 0) {
       newClass = newClass.replace(' ' + cls + ' ', ' ');
     }
     elem.className = newClass.replace(/^\s+|\s+$/g, '');
   }
 }
