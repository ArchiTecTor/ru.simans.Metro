/*
 Виджет множественного выбора станций метро
 Имеет карту с кнопками выбора и список дублирующий выбор станций
 ввиду особой геморойности реализации тонкостей каждого браузера (особенно обработки событий в IE)
 и принципа скока можно велосипедить, пора отдать другим, используется jquery библиотека, поэтому для
 работы она должна быть подключена
 
 Порядок создания элементов таков
 1 создаем основную карту
    var metro=new ru.simans.Metro('metro','/images/metro.jpg');
 2 создаем линию метро
    var line=new ru.simans.MetroLine(object);
    object = {
        name: 'Каховская линия', // имя отображаемое в правом списке выбора, как имя группы для станций
        color: 'red', // цвет станций на этой линии
    }
 3 можно добавить линию на карту сразу, а добавить в линию новые станции. они будут отображены немедленно
    metro.addLine(line);
    
 4 соответственно добавляем сами станции
    line.addStation(station);
    station=new ru.simans.MetroStation({
        name: 'Каширская', // имя станции
        id: 1, // id передается в параметре запроса в виде metro=1,metro=2..
        x: 10, // координаты виджета (кнопки) внутри контейнера
        y: 20,
        color: 'red', // не нужный пока параметр, при добавлении в линию все равно переопределяется
        onSelected: function(){}, // выполнится при выборе элемента
    });
*/
var ru;
if(!ru)
    ru={};
else if(typeof(ru)!='object')
    throw new Error('пространство имен ru существует но не в виде объекта');

if(!ru.simans)
    ru.simans={};
else if(typeof(ru.simans)!='object')
    throw new Error('пространство имен ru.simans существует но не в виде объекта');

if(ru.simans.Metro)
    throw new Error('пространство имен ru.simans.Metro существует');



// обязательно нужно передать id контейнера для карты и местоположение самого изображения-подложки
// пример new ru.simans.Metro('metro','/images/metro.jpg');
ru.simans.Metro=function(canvas_id,metro_file){
    var canvas=document.getElementById(canvas_id);
    if(!canvas) throw new Error("element with id="+canvas_id+" not found!");
    if(!metro_file) throw new Error("image file for Metro map with filename "+metro_file+" not found!");

    canvas.className='ru_simans_Metro';
    canvas.style.position='relative';
    canvas.style.margin='0';
    canvas.style.padding='0';
    canvas.style.border='0';
    
    this.id=canvas_id;

    var image=document.createElement('img');
    image.src=metro_file;
    image.style.float='left';
    image.style.margin='0';
    image.style.padding='0';
    image.style.border='0';
    canvas.appendChild(image);


    var stations_select=document.createElement('select');
    stations_select.multiple='multiple';
    stations_select.name='metro';
    stations_select.className='ru_simans_Metro stationsList';
    canvas.appendChild(stations_select);    
    this.stationsSelect=stations_select;
    
    if(!(this.width=canvas.offsetWidth)) throw new Error("bad metro width: "+canvas.offsetWidth+" obj "+canvas);
    if(!(this.height=canvas.offsetHeight)) throw new Error("bad metro height: "+canvas.offsetHeight);
    
    this.map=image;
    this.canvas=canvas;
    this.lines=new Array();
    
    
};


ru.simans.Metro.prototype.addLine=function(line){
    var metro=this;
    metro.lines.push(line);
        
    this.canvas.appendChild(line.container);
    line.container=this.canvas;
    
    this.stationsSelect.appendChild(line.selectGroup);

    $(this.stationsSelect).bind('click',function(){
        metro.selectToggleSelected();
    });
    
    
};

ru.simans.Metro.prototype.selectToggleSelected=function(){

    for(var line=0; line < this.lines.length; line++){
        var this_line=this.lines[line];
        for(var station=0; station<this_line.stations.length; station++){
            
            var this_station=this_line.stations[station];
            
            if(this_station.selectItem.selected){
                this_station.setButtonSelected(1);
            }
            else{
                this_station.setButtonSelected(0);
            }
            
        }
    }
    
        

};


ru.simans.MetroLine=function(obj){
    this.name=obj.name;
    this.stations=new Array();
    this.color=obj.color;
    this.selectedColor=obj.selectedColor;
    this.selectGroup=document.createElement('optgroup');
    this.selectGroup.label=this.name;
    this.selectGroup.style.color=this.color;
    this.container=document.createDocumentFragment();
};

ru.simans.MetroLine.prototype.addStation=function(station){
    
    this.stations.push(station);
    station.setColor(this.color);
    this.container.appendChild(station.getWidget());
    this.selectGroup.appendChild(station.getSelectOption());
};

ru.simans.MetroLine.prototype.toString=function(){
    var out="<pre>var line=new ru.simans.MetroLine({name:'"+this.name+"', color:'"+this.color+"'});\n";
    for(var station=0; station<this.stations.length; station++){
        var this_station=this.stations[station];
        out+='line.addStation('+this_station+');\n';
    }
    return out+'</pre>';
}

ru.simans.MetroStation=function(obj){
    this.name=obj.name;
    this.id=obj.id;
    this.x=obj.x;
    this.y=obj.y;
    this.color=obj.color;
    
    this.selected=obj.selected||0;
    this.name=obj.name;
    this.onSelected=obj.onSelected||function(){};// а вдруг пригодится)
    this.button=document.createElement('button');
    this.selectItem=document.createElement('option');

    this.selectItem.appendChild(document.createTextNode(this.name));
    this.selectItem.value=this.id;
    this.button.title=this.name;
    this.button.setAttribute('id','MetroStation'+this.id);
    //this.button.setAttribute('value',this.id);
    
    this.button.style.backgroundColor=this.color;

    
    var station=this;
    
    $(this.button).bind('click',function(event){
        event.preventDefault();
        station.toggleSelected();
    });

    if(this.selected){
        //console.log('id - %d selected - %s',this.id, this.selected);
        this.setSelected(1);
    }
    else{
        //console.log('id - %d selected - %s',this.id, this.selected);
        this.setSelected(0);
    }
    
    this.button.style.position='absolute';
    
    this.button.style.top=this.y+'px';
    this.button.style.left=this.x+'px';
    
};

ru.simans.MetroStation.prototype.setSelected=function(select){
    if(select){
        this.button.className='ru_simans_MetroStation selected';    
        this.selectItem.selected=true;
        
        this.button.style.backgroundColor='';
        this.selected=true;
        this.onSelected();
    }
    else{
        this.button.className='ru_simans_MetroStation';
        this.selectItem.selected=false;
        this.button.style.backgroundColor=this.color;
        
        this.selected=false;
    }
    
}

ru.simans.MetroStation.prototype.setButtonSelected=function(select){
    if(select){
        this.button.className='ru_simans_MetroStation selected';
        this.button.style.backgroundColor='';
        this.selected=true;
        this.onSelected();
    }
    else{
        this.button.className='ru_simans_MetroStation';
        this.button.style.backgroundColor=this.color;
        this.selected=false;
    }
}


ru.simans.MetroStation.prototype.toggleSelected=function(){
    if(this.selected){
        this.setSelected(0);
    }
    else{
        this.setSelected(1);
    }
};

ru.simans.MetroStation.prototype.toString=function(){
    var obj=' new MetroStation({\n';
    for(var field in this){
        if(typeof(this[field])=='string'||typeof(this[field])=='number')
            obj+='    '+field+":'"+this[field]+"',\n";
    }
    obj+='})\n';
    return obj;
};

ru.simans.MetroStation.prototype.getWidget=function(){
    return this.button;
};
 
ru.simans.MetroStation.prototype.getSelectOption=function(){
    return this.selectItem;
};

ru.simans.MetroStation.prototype.setColor=function(color){
    this.color=color;
    this.button.style.backgroundColor=color;
};


