var chinaAdd = null;
var chinaTotal = null;
var countryData = null;
var historyList = null;
var countryName = []
var confiredNumber = []

// 在柱状图中，实现分页显示
// 当前的页数
var currentPage = 1;
// 总共的页数，出去湖北一共有33个，没11个为一组
var totalPage = 3;

// 获取疫情数据
$.ajax({
    url: 'https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5',
    dataType: 'jsonp',
    success: function(res) {
        // console.log(JSON.parse(res.data));
        var data = JSON.parse(res.data);
        // console.log(data);
        chinaAdd = data.chinaAdd
        chinaTotal = data.chinaTotal
        countryData = data.areaTree[0].children
        console.log(countryData);
        // console.log(chinaAdd);
        // 初始化信息框
        initInfo();
        // 初始化地图
        initMap();
        // 初始化柱状图

        for (let i = 0; i < countryData.length; i++) {
            if(countryData[i].name !== '湖北') {
                countryName.push(countryData[i].name)
                confiredNumber.push(countryData[i].total.confirm)
            }       
        }
        initBar();
        startInterval()
        // 初始化饼图
        initPie();
    }
})

$.ajax({
    url: 'http://news.sina.com.cn/project/fymap/ncp2020_full_data.json',
    dataType: 'jsonp',
    jsonpCallback: 'jsoncallback',
    success: function(res) {
        // console.log(res)
        var allData = res.data;
        historyList = allData.historylist
        // console.log(historyList);
        // 初始化折线图
        initLine();
        
    }
})

// 初始化饼图
function initPie() {
    var mPieCharts = echarts.init(document.getElementById('pie'))

    var healNum = []
    for(let i = 0; i < countryData.length; i++) {
        healNum.push({name: countryData[i].name, value: countryData[i].total.heal})
    }
    var optionPie = {
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                name: '治愈人数',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '40',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: healNum
            }
        ]
    };

    mPieCharts.setOption(optionPie);
}

// 初始化柱状图
function  initBar() {
    let start = (currentPage-1)*11; // 0 11
    let end = currentPage * 11;
    var mBarCharts = echarts.init(document.getElementById('bar'));
    var countryNamePage = countryName.slice(start, end);
    var confiredNumberPage = confiredNumber.slice(start, end);


    var optionBar = {
        xAxis: {
            type: 'value',
            axisLine:{
                lineStyle:{
                    color:'white',
                    padding: 10,
                    width:3,//这里是为了突出显示加上的
                }
            } 
        },
        yAxis: {
            type: 'category',
            data: countryNamePage,
            axisLabel: {
                interval: 0,
                rotate: 35,
                
            },
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:3,//这里是为了突出显示加上的
                }
            } 
        },
        series: [
            {
                type: 'bar',
                data: confiredNumberPage,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0,0,0,1,[{
                            offset: 0,
                            color: '#4f59ec'
                        },{
                            offset: 1,
                            color: '#a279e5'
                        }]),
                        barBorderRadius: [0,10,10,0]
                    },
                    radius: 20
                }
                
            }
        ]
    }

    mBarCharts.setOption(optionBar);
}

// 定义一个计时器
function startInterval() {
    setInterval(function gotoNextPage() {
        currentPage++;
        if (currentPage > totalPage) {
            currentPage = 1;
        }
        initBar();
    }, 5000)
}

// 初始化折线图
function initLine() {
    var mLineCharts = echarts.init(document.getElementById('line'))

    var cn_conadd = [];
    var date = [];
    for(let i = 6; i >= 0; i--) {
        date.push(historyList[i].ymd)
        cn_conadd.push(historyList[i].cn_conadd)
    }

    var optionLine = {
        xAxis: {
            type: 'category',
            data: date,
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:3,//这里是为了突出显示加上的
                }
            } 

        },
        yAxis: {
            type: 'value',
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:3,//这里是为了突出显示加上的
                }
            } 

        },
        series: [{
            data: cn_conadd,
            type: 'line',
            label: {
                show: true
            }
        }]
    };

    mLineCharts.setOption(optionLine)
}


// 初始化地图
function initMap() {
    var mCharts = echarts.init(document.getElementById('map'))
    var myData = [];
    var deadRate = [];
    var healRate = [];
    for(let i = 0; i < countryData.length; i++) {
        myData.push({name: countryData[i].name, value: countryData[i].total.confirm})
        deadRate.push({name: countryData[i].name, value: countryData[i].total.deadRate})
        healRate.push({name: countryData[i].name, value: countryData[i].total.healRate})
    }
    $.get('../json/map/china.json', function(ret) {
        console.log(ret)
        echarts.registerMap('chinaMap', ret);
        var option = {
            geo: {
                type: 'map',
                map: 'chinaMap',
                zoom: 1.22,
                label: {
                    show: true,
                    color: 'white'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(param) {
                    var res = ''
                    for(let i = 0; i < myData.length; i++) {
                        if(myData[i].name == param.name) {
                            res += '累计确诊人数：' + myData[i].value + '<br/>' +
                                    '治愈率：' + healRate[i].value + '%<br/>' +
                                    '死亡率：' + deadRate[i].value + '%<br/>';
                            break;
                        }
                    }
                    return res;
                }
            },
            visualMap: {
                type: 'piecewise',
                pieces: [
                    {min: 2000, label: '≥2000', color: '#f32c17'},
                    {min: 1000, max: 2000, label: '1000-2000', color: '#f35517'},
                    {min: 500, max: 1000, label: '500-1000', color: '#f38617'},
                    {min: 100, max: 500, label: '100-500', color: '#e7d842'},
                    {min: 0, max: 100, label: '0-100', color: '#36b158'}     // 不指定 min，表示 min 为无限大（-Infinity）。
                ],
                textStyle: {
                    color: 'white'
                }
            },
            series: [
                {
                    type: 'map',
                    geoIndex: 0,
                    data: myData
                }
            ]
        }
        mCharts.setOption(option)
        // 设置监听
         //去除默认的鼠标事件
        document.oncontextmenu = function () { return false; }; 
        // 鼠标右键点击事件
        mCharts.on('contextmenu', function(param) {
            option.geo.map = 'chinaMap'
            mCharts.setOption(option);
        })
        mCharts.on('click', function(param){
            var characterToStr = [
                {name: '安徽', value: 'anhui'},
                {name: '澳门', value: 'aomen'},
                {name: '北京', value: 'beijing'},
                {name: '重庆', value: 'chongqing'},
                {name: '福建', value: 'fujian'},
                {name: '甘肃', value: 'gansu'},
                {name: '广东', value: 'guangdong'},
                {name: '广西', value: 'guangxi'},
                {name: '贵州', value: 'guizhou'},
                {name: '海南', value: 'hainan'},
                {name: '河北', value: 'hebei'},
                {name: '黑龙江', value: 'heilongjiang'},
                {name: '河南', value: 'henan'},
                {name: '湖北', value: 'hubei'},
                {name: '湖南', value: 'hunan'},
                {name: '江苏', value: 'jiangsu'},
                {name: '江西', value: 'jiangxi'},
                {name: '吉林', value: 'jilin'},
                {name: '辽宁', value: 'liaoning'},
                {name: '内蒙古', value: 'neimenggu'},
                {name: '宁夏', value: 'ningxia'},
                {name: '青海', value: 'qinghai'},
                {name: '山东', value: 'shandong'},
                {name: '上海', value: 'shanghai'},
                {name: '山西', value: 'shanxi'},
                {name: '陕西', value: 'shanxi1'},
                {name: '四川', value: 'sichuan'},
                {name: '台湾', value: 'taiwan'},
                {name: '天津', value: 'tianjin'},
                {name: '香港', value: 'xianggang'},
                {name: '新疆', value: 'xinjiang'},
                {name: '西藏', value: 'xizang'},
                {name: '云南', value: 'yunnan'},
                {name: '浙江', value: 'zhejiang'},
            ]
            // console.log(param.name);
            for(let i = 0; i < characterToStr.length; i++) {
                if(param.name === characterToStr[i].name){
                    // console.log(characterToStr[i])
                    $.get('../json/map/province/'+characterToStr[i].value+'.json', function(ret) {
                        console.log(ret)
                        // 取出市或区
                        for (let i = 0; i < ret.features.length;i++) {
                            let name = ret.features[i].properties.name
                            let index = ret.features[i].properties.name.length-1
                            if(name[index] === '市' || name[index] === '区') {
                                ret.features[i].properties.name = ret.features[i].properties.name.substr(0, index)
                            }
                        }
                        echarts.registerMap(characterToStr[i].value, ret);

                        // 获取数据
                        var provinceData = [];
                        for (let i = 0; i < countryData.length; i++) {
                            if(param.name === countryData[i].name) {
                                for (let j = 0; j < countryData[i].children.length; j++) {
                                    provinceData.push({name: countryData[i].children[j].name, value: countryData[i].children[j].total.nowConfirm})
                                }
                                break;
                            }
                        }
                        var changeOption = {
                            geo: {
                                map: characterToStr[i].value
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: function(param) {
                                    for (let i = 0; i < provinceData.length; i++) {
                                        if(param.name === provinceData[i].name) {
                                            return '确诊人数：' + provinceData[i].value
                                        }
                                    }
                                    return 
                                }
                            },
                            visualMap: {
                                type: 'piecewise',
                                pieces: [
                                    {min: 50, label: '≥2000', color: '#f32c17'},
                                    {min: 20, max: 50, label: '1000-2000', color: '#f35517'},
                                    {min: 10, max: 20, label: '500-1000', color: '#f38617'},
                                    {min: 1, max: 10, label: '100-500', color: '#e7d842'},
                                    {min: 0, max: 0, label: '0-100', color: '#36b158'}     // 不指定 min，表示 min 为无限大（-Infinity）。
                                ],
                                textStyle: {
                                    color: 'white'
                                }
                            },
                            series: [{
                                data: provinceData
                            }]
                        }
                        mCharts.setOption(changeOption);
                    })
                    break;
                }
            }
        })

    })
}

// 初始化信息框
function initInfo() {
    let htmlStr = `<li>
    <div>
        <span style="color: #ff5e49;">${chinaAdd.confirm}</span>
        <h3>确诊人数</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #36b158;">${chinaAdd.heal}</span>
        <h3>治愈人数</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #fe653b;">${chinaAdd.suspect}</span>
        <h3>疑似病例</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #fe8d00;">${chinaAdd.importedCase}</span>
        <h3>境外输入</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #525498;">${chinaAdd.importedCase}</span>
        <h3>死亡人数</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #ff5e49;">${chinaTotal.confirm}</span>
        <h3>累计确诊</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #36b158;">${chinaTotal.heal}</span>
        <h3>累计治愈</h3>
    </div>
</li>
<li>
    <div>
        <span style="color: #fe653b;">${chinaTotal.suspect}</span>
        <h3>累计疑似</h3>
    </div>
</li>
<li>
    <div style="color: #fe8d00;">
        <span>${chinaTotal.importedCase}</span>
        <h3>累计境外输入</h3>
    </div>
</li>
<li>
    <div style="color: #525498;">
        <span>${chinaTotal.dead}</span>
        <h3>累计死亡人数</h3>
    </div>
</li>   `
    $('.panel_info ul').html(htmlStr);
}