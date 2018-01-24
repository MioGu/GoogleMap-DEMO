var map;
var markers = [];
var largeInfowindow;

var locations = [
  { title: '上海浦东国际机场', location: { lat:31.144656, lng:121.808167} },
  { title: '长春', location: { lat:43.817071, lng:125.323544 } },
  { title: '沈阳', location: { lat:41.805699, lng:123.431472 } },
  { title: '哈尔滨', location: { lat:45.803775, lng:126.534967 } },
  { title: '南通', location: { lat:31.980171, lng:120.894291 } },
  { title: '苏州', location: { lat:31.298974, lng:120.585289 } },
  { title: '杭州', location: { lat:30.274084, lng:120.15507 } },
  { title: '上海外滩', location: { lat:31.233004, lng:121.492782 } },
]

var mapViewModel = function() {
  //用于判断是否隐藏侧滑菜单
  this.isHideMenu = ko.observable(true);

  this.searchArray = ko.observableArray(locations);

  this.searchContent = ko.observable('');

  //筛选按钮逻辑
  this.filter = () => {
    if(this.searchContent() == ''){
      this.searchArray(locations);
    }else{
      let temp = [];
      locations.forEach((val,index,arr)=>{
        if(val.title.indexOf(this.searchContent()) != -1 ){
          temp.push(val);
        }
        this.searchArray(temp);
      })
    } 
  }

  //隐藏状态发生改变
  this.hideStateChange = () => {
    this.isHideMenu(!this.isHideMenu());
  }


  //点击列表中 地点 显示地图中标记
  this.showCurrentMarker = (title) => {
    markers.forEach(val=>{
      if(val.title===title){
        map.setCenter(val.position);
        populateInfoWindow(val, largeInfowindow)
      }
    })
  }
}


ko.applyBindings( new mapViewModel() )

function initMap() {


  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat:31.233004, lng:121.492782 },
    zoom: 14
  })



  largeInfowindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations.length; i++) {
    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,   // 初始加载时候的跳动效果
      id: i
    })

    // 把循环的 marker 推入 markders 数组
    markers.push(marker);

    // 监听一个点击事件来为每一个marker打开信息窗口
    marker.addListener('click', function () {
      populateInfoWindow(this, largeInfowindow)
    })
  }


  showListings();

}

function showListings() {
  var bounds = new google.maps.LatLngBounds();
  for(var i=0; i<markers.length; i++){
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  // 告诉地图将这些边界融入
  map.fitBounds(bounds);
}

function hideListings() {
  for(var i=0; i<markers.length; i++){
    markers[i].setMap(null);
  }
}

function populateInfoWindow(marker, infowindow) {
  
  marker.setAnimation(google.maps.Animation.Ro)
  // 确保当前标记上的信息窗口没有被打开
  if (infowindow.marker != marker) {
    

    // 此处为第三方请求接口
    $.ajax({
      type: 'GET',
      url: 'http://v.juhe.cn/weather/geo',
      data: {
        key: 'fc78b7577fb3460341503126eebcfd25',
        dtype: 'json',
        lon: marker.position.lng,
        lat: marker.position.lat
      },
      dataType: "jsonp",
      beforeSend: function() {
        infowindow.setContent('<div>正在请求数据...</div>')
      },
      success: function(data) {
        console.log(data.result.today);
        let info = data.result.today;
        infowindow.setContent
        (`<div>
          <p>城市：${info.city}</p>
          <p>天气：${info.weather}</p>
          <p>温度：${info.temperature}</p>
          <p>风向：${info.wind}</p>
        </div>`);
      },
      error: function(error) {
        console.log(error);
        infowindow.setContent('<div>数据请求失败</div>')
      }
    })


    infowindow.marker = marker;
    infowindow.open(map, marker);

    // 确保当信息窗口关闭的时候 marker 已被清空
    infowindow.addListener('closeclick', function () {
      // 关闭窗口以及停止跳动
      infowindow.marker = null;
      marker.setAnimation(null);
    })
  }

}