var canvas = document.getElementById("realCanvas");
var tmp_board = document.getElementById("tempCanvas");
var b_width = canvas.width, b_height = canvas.height;
var ctx = canvas.getContext("2d");
var context = tmp_board.getContext("2d");
var x, y; 
var saved = false, hold = false, fill = false, stroke = true, tool = 'circle';
var data = {"rectangle": [], "circle": [], "line": []};

function curr_tool(selected){tool = selected;}

function attributes(){
	if (document.getElementById("fill").checked)
		fill = true;
	else
		fill = false;
	if (document.getElementById("outline").checked)
		stroke = true;
	else
		stroke = false;
}

function thickness(){
	context.lineWidth = document.getElementById("selclr").value;
}

function clears(){
	ctx.clearRect(0, 0, b_width, b_height);
	context.clearRect(0, 0, b_width, b_height);
	data = {"rectangle": [], "circle": [], "line": []};
}

function color(scolor){  
	context.strokeStyle = scolor;
	if (document.getElementById("fill").checked)
		context.fillStyle = scolor; 
}

tmp_board.onmousedown = function(e) {
	attributes();
	hold = true;
	x = e.pageX - this.offsetLeft;
	y = e.pageY -this.offsetTop;
	begin_x = x;
	begin_y = y;
	context.beginPath();
	context.moveTo(begin_x, begin_y);    
}

tmp_board.onmousemove = function(e) {
	if (x == null || y == null) {
		return;
 	}
	if(hold){
		x = e.pageX - this.offsetLeft;
		y = e.pageY - this.offsetTop;
		Draw();
	}
}
     
tmp_board.onmouseup = function(e) {
	ctx.drawImage(tmp_board,0, 0);
	context.clearRect(0, 0, tmp_board.width, tmp_board.height);
	end_x = x;
	end_y = y;
	x = null;
	y = null;
	Draw();
	hold = false;
}

function Draw(){
	if (tool == 'rectangle'){
		if(!x && !y){
			data.rectangle.push({"x": begin_x, "y": begin_y, "width": end_x-begin_x, "height": end_y-begin_y,
							"thick": context.lineWidth, "stroke": stroke, "strk_clr": context.strokeStyle,
							 "fill": fill, "fill_clr": context.fillStyle });
			return;
		}  
		context.clearRect(0, 0, b_width, b_height);
		context.beginPath();
		if(stroke)
			context.strokeRect(begin_x, begin_y, x-begin_x, y-begin_y);
		if(fill) 
			context.fillRect(begin_x, begin_y, x-begin_x, y-begin_y);
		context.closePath();
	}
	else if (tool == 'circle'){   
		if(!x && !y){
			data.circle.push({"x": begin_x, "y": begin_y, "radius": end_x-begin_x, 
							"thick": context.lineWidth, "stroke": stroke, "strk_clr": context.strokeStyle,
							"fill": fill, "fill_clr": context.fillStyle });   
			return;
		}
		context.clearRect(0, 0, b_width, b_height);
		context.beginPath();
		context.arc(begin_x, begin_y, Math.abs(x-begin_x), 0 , 2 * Math.PI, false);
		if(stroke) 
			context.stroke();
		if(fill) 
			context.fill();
		context.closePath();
	}
	else if (tool == 'line'){ 
		if(!x && !y){
			data.line.push({"x": begin_x, "y": begin_y, "end_x": end_x, "end_y": end_y,
                            "thick": context.lineWidth, "color": context.strokeStyle });
			return;
		}
		context.clearRect(0, 0, b_width, b_height);
		context.beginPath();
		context.moveTo(begin_x, begin_y);
		context.lineTo(x, y);
		context.stroke();
		context.closePath();
	}
}

function is_there(fname){
	for(var each in py_data){
		if(each == fname) 
		return true;
	}
	return false;
}

function save(){
	var f_name =  document.getElementById("fname").value;
	var title = document.getElementById('name').innerHTML;
	if(!f_name){
		alert("Enter a Filename to save!");
		return;
	}
	var exist = is_there(f_name);
	if(!saved && exist){
		alert("File name already exists!");
		return;
	} 
	$.post("/",{fname: f_name, whole_data: JSON.stringify(data)}); 
	title = f_name;
	alert("Saved....!");
}

$(".img_files").click(function(){ 
	var img_fname = $(this).text();
	document.getElementById('name').innerHTML = img_fname;
	document.getElementById("fname").value = img_fname;
	clears();
	iter_py_data(img_fname);
});

function iter_py_data(img_name){
	saved = true;
	for(var key in py_data){
		if(key == img_name){
			file_data = JSON.parse(py_data[key]);
			for(var ptool in file_data){
				if(file_data[ptool].length != 0){
					for(var i=0; i<file_data[ptool].length; i++){
						data[ptool].push(file_data[ptool][i]);
						shape_draw(ptool, file_data[ptool][i]);
					}
				}
			}
		}
	}
}

function shape_draw(ctool, shape){
	if (ctool == 'rectangle'){
		var r_x = shape.x, r_y = shape.y, width = shape.width, height = shape.height;
			stroke = shape.stroke, fill = shape.fill;   
		ctx.beginPath();
		ctx.lineWidth = shape.thick;
		ctx.strokeStyle = shape.strk_clr;
		ctx.fillStyle = shape.fill_clr;
		if(stroke)
			ctx.strokeRect(r_x, r_y, width, height);
		if(fill) 
			ctx.fillRect(r_x, r_y, width, height);
		ctx.closePath();  
	}
	else if (ctool == 'circle'){   
		var c_x = shape.x, c_y = shape.y, width = shape.radius, stroke = shape.stroke,
		fill = shape.fill;
		ctx.beginPath();
		ctx.lineWidth = shape.thick;
		ctx.strokeStyle = shape.strk_clr;
		ctx.fillStyle = shape.fill_clr;
		ctx.arc(c_x, c_y, Math.abs(width), 0 , 2 * Math.PI, false);
		if(stroke) 
			ctx.stroke();
		if(fill) 
			ctx.fill();
		ctx.closePath();
	}
	else if (ctool == 'line'){
		ctx.beginPath();
		var l_x = shape.x;
		var l_y = shape.y;
		var lend_x = shape.end_x;
		var lend_y = shape.end_y;
		ctx.lineWidth = shape.thick;
		ctx.strokeStyle = shape.color;
		ctx.moveTo(l_x, l_y);
		ctx.lineTo(lend_x, lend_y);
		ctx.stroke();
		ctx.closePath();
	}
}