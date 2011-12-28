// классы для редакторивания карты ru.simans.Metro
// Добавляет панель для добавления линии/станции на линии
// для использования нужно задать в качестве конструктора не ru.simans.Metro
// а его наследника - ru.simans.MetroEditor

// чумовой способ, надо разобраться как всетаки работает..
function extend(Child, Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
};


ru.simans.MetroEditor=function(canvas_id,metro_file){
    //ru.simans.Metro(canvas_id,metro_file);
    ru.simans.MetroEditor.superclass.constructor.call(this,canvas_id,metro_file);
    //this.prototype=new ru.simans.Metro(canvas_id,metro_file);
        
    var container=this;
    container.toolPanel=document.createElement('div');
    container.toolPanel.className='ru_simans_MetroEditor tool_panel';
    container.toolPanelElements={};
    container.map.style.cursor='crosshair';
    
    var linesPanel=document.createElement('fieldset');
    linesPanel.className='linesPanel';
    linesPanel.innerHTML='<legend>Работа с линиями метро</legend>';
    //виджет выбора текущей линии
    this.linesList=document.createElement('select');
    this.linesList.multiple='multiple';
    linesPanel.appendChild(this.linesList);
    container.toolPanelElements.linesList=this.linesList;
    
    //виджет добавления новой линии
    // поле ввода имени линии
    container.toolPanelElements.nameLine=document.createElement('input');
    var tmp=document.createElement('label');
    tmp.appendChild(document.createTextNode('имя линии'));
    tmp.appendChild(container.toolPanelElements.nameLine);
    linesPanel.appendChild(tmp);
    
    linesPanel.appendChild(document.createElement('br'));
    
    //поле ввода цвета линии
    tmp=document.createElement('label');
    tmp.appendChild(document.createTextNode('цвет линии'));
    container.toolPanelElements.colorLine=document.createElement('input');
    tmp.appendChild(container.toolPanelElements.colorLine);
    linesPanel.appendChild(tmp);
    linesPanel.appendChild(document.createElement('br'));
    container.toolPanelElements.addLineButton=document.createElement('input');
    container.toolPanelElements.addLineButton.type='button';
    container.toolPanelElements.addLineButton.value='добавить линию';
    container.toolPanelElements.addLineButton.onclick=function(){
        container.addLine(new ru.simans.MetroLine({
            name: container.toolPanelElements.nameLine.value,
            color: container.toolPanelElements.colorLine.value,
        }));
    }
    linesPanel.appendChild(container.toolPanelElements.addLineButton);
    
    //добавим панель редактирования новых линий на экран
    container.toolPanel.appendChild(linesPanel);
    
    
    //добавление станции
    var addStationButton=document.createElement('button');
    addStationButton.disabled='true';
    addStationButton.innerHTML='Добавить станцию';
    addStationButton.onclick=function(event){
        
        container.cursor=document.createElement('button');
        container.cursor.className='ru_simans_MetroStation cursor';
        container.cursor.style.position='absolute';
        container.infoPanel=document.createElement('span');
        container.infoPanel.style.position='absolute';
        container.infoPanel.style.visibility='hidden';
        container.infoPanel.className='infoPanel';
        
        container.canvas.appendChild(container.infoPanel);
        container.canvas.appendChild(container.cursor);
        
        container.map.onmousemove=function(event){
            container.infoPanel.style.visibility='visible';
            container.infoPanel.innerHTML=event.clientX+':'+event.clientY;
            container.infoPanel.style.top=(event.offsetY+15)+'px';
            container.infoPanel.style.left=(event.offsetX-15)+'px';
            container.cursor.style.top=(event.offsetY-20)+'px';
            container.cursor.style.left=(event.offsetX-20)+'px';
            
        };
        
        window.onkeyup=function(event){
            container.map.onclick=undefined;
            container.map.onmousemove=undefined;
            container.canvas.removeChild(container.infoPanel);
            container.canvas.removeChild(container.cursor);
            window.onkeyup=undefined;
        };
        
        container.map.onclick=function(event){
            container.addNewStation(event.offsetX-20,event.offsetY-20);
            event.target.onclick='';
            event.target.onmousemove='';
            container.canvas.removeChild(container.infoPanel);
            window.onkeyup=function(){};
        };
        event.preventDefault();
    }
    this.toolPanel.appendChild(addStationButton);
    container.toolPanelElements.addStationButton=addStationButton;
    
    //сериализация находящихся станций
    var viewStations=document.createElement('button');
    viewStations.innerHTML='Вывести все станции';
    viewStations.onclick=function(event){
        var out='';
        for(var line=0; line < container.lines.length; line++){
            var this_line=container.lines[line];
            out+=this_line;
            /*for(var station=0; station<this_line.stations.length; station++){
                
                var this_station=this_line.stations[station];
                
                out+=this_station;
                
            }*/
        }
        
        var exportWindow=window.open();
        exportWindow.document.open();
        
        with(exportWindow){
            document.write(out);
        }
        event.preventDefault();
    }
    this.toolPanel.appendChild(viewStations);
    container.toolPanelElements.viewStations=viewStations;
    
    this.canvas.appendChild(container.toolPanel);
    
}

// расширим класс metro
extend(ru.simans.MetroEditor, ru.simans.Metro);

ru.simans.MetroEditor.prototype.addLine=function(line){
    ru.simans.MetroEditor.superclass.addLine.call(this,line);
    
    var element=document.createElement('option');
    var container=this;
    element.appendChild(document.createTextNode(line.name));
    element.style.color=line.color;
    element.onclick=function(event){
        container.selectLine=line;
        console.log('выбрана линия '+line.name);
        container.toolPanelElements.addStationButton.disabled=undefined;
        
    };
    this.linesList.appendChild(element);
    
    
};


ru.simans.MetroEditor.prototype.addNewStation=function(x,y){
    var id_name=window.prompt('enter station id:name');
    var result=id_name.split(':');
    var line=this.selectLine;
    line.addStation(new ru.simans.MetroStation({'x':x,'y':y,'name':result[1],'id':result[0]}));
}