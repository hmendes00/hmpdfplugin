(function ( $ ) {
 
    $.fn.hmpdf = function( options ) {
 
        //setting defaults
        var SETTINGS = $.extend({
            borderColor: "#DDDDDD",
            backgroundColor: "white",
	    withControls: "all"
        }, options );
 	
	this.addClass("hmpdf-main-container");
        this.css({
            borderColor: SETTINGS.borderColor,
            backgroundColor: SETTINGS.backgroundColor
        }); 
	
	this.loadControls = function(type, $this){
		if(type){
			$toolsDiv = $("<div>");
			$toolsDiv.addClass("hmpdf-tools");
			loadControlObjects(type, $toolsDiv);
			pdfTool($toolsDiv);
			$this.append($toolsDiv);
		}
	}

	this.loadControls(SETTINGS.withControls, this);
	
	loadEditableArea(this);
	loadObjectEvents();

	return this;
    };

    function loadEditableArea($obj){
	$editableArea = $("<div>");
	$editableArea.addClass("hmpdf-main-editablearea");
	$obj.append($editableArea);
    	$.fn.hmpdf.area = $(".hmpdf-main-editablearea");
    }

    function loadObjectEvents(){
	$(document).on("mousedown", ".hmpdf-isobject", function(){
		$.fn.hmpdf.selectedObj = $(this);
	}).on("keydown", function(e){
		if($.fn.hmpdf.selectedObj != undefined){
			if(e.keyCode == 46){ //is delete key
				$.fn.hmpdf.selectedObj.remove();
				$.fn.hmpdf.selectedObj = null;
			}
		}
	});
    }

    function loadControlObjects(type, $toolsDiv){
	switch(type){
		case "all": {			
			fullTextTool($toolsDiv);
			basicForms($toolsDiv);
		};break;
		case "textonly": {
			fullTextTool($toolsDiv);
		};break;
		case "default": {
			fullTextTool($toolsDiv);
		};break;	
	}
    }

    function basicForms($toolsDiv){
	imageTool($toolsDiv);
	squareTool($toolsDiv);
	circleTool($toolsDiv);
	//lineTool(toolsDiv);
    }

    function fullTextTool($toolsDiv){
	textTool($toolsDiv);
	//textColorTool(toolsDiv);
	//textFormat(toolsDiv);
    }

    function imageTool($toolsDiv){
	$objDivTool = createBasicTool($toolsDiv, "imagetool.png");
	$objDivTool.on("click", function(){
		$objFile = $("<input>").attr("type", "file").css("display", "none").attr("accept", "image/*");
		$("body").append($objFile);
		$objFile.on("change", function(){
			readURL(this);
			
		});
		$objFile.click();
	});
    }

    function squareTool($toolsDiv){
	$objDivTool = createBasicTool($toolsDiv, "squaretool.png");
	$objDivTool.on("click", function(){
		$objDivObj = createBasicObject();
		$objDivObj.append($("<div>").addClass("hmpdf-object-html").addClass("hmpdf-object-geoform").addClass("hmpdf-object-square"));
		makeDraggable($objDivObj);
	});
    }

    function circleTool($toolsDiv){
	$objDivTool = createBasicTool($toolsDiv, "circletool.png");
	$objDivTool.on("click", function(){
		$objDivObj = createBasicObject();
		$objDivObj.append($("<div>").addClass("hmpdf-object-html").addClass("hmpdf-object-geoform").addClass("hmpdf-object-circle"));
		makeDraggable($objDivObj);
	});
    }

    function pdfTool($toolsDiv){
	$objDivTool = createBasicTool($toolsDiv, "pdftool.png");
	$objDivTool.on("click", function(){
		$(".hmpdf-main-editablearea .hmpdf-isobject").css("border", "none");
		$(".hmpdf-object-circle").css("border-radius", "2000px");
		setTimeout(createPDF(), 0);
			$(".hmpdf-object-circle").css("border-radius", "100%");
		setTimeout(function(){
			$(".hmpdf-main-editablearea .hmpdf-isobject").css("border", "1px dashed #999999");
		}
		, 60);
	});
    }

    function readURL(input) {
	if (input.files && input.files[0]) {
		var _reader = new FileReader();
		_reader.onload = function(e) {
		$objDivObj = createBasicObject();
			$objDivObj.append($("<img>").addClass("hmpdf-object-html").attr("src", e.target.result));
			makeDraggable($objDivObj);
		}

		_reader.readAsDataURL(input.files[0]);
    	}
    }

    function textTool($toolsDiv){
	$objDivTool = createBasicTool($toolsDiv, "texttool.png");
	$objDivTool.on("click", function(){
		$objDivObj = createBasicObject();
		$objDivObj.append($("<p>").addClass("hmpdf-object-html").html("Text"));
		makeDraggable($objDivObj);
		$objDivObj.on("dblclick", function(){
			createModal();
			$(".hmpdf-texteditor").hmpdfedit();
			$(".hmpdf-screen-modaleditor .editor").html($objDivObj.find(".hmpdf-object-html").html());
			$(".hmpdf-screen-modaleditor .toolbar [command=save]").on("click", function(){
				$objDivObj.find(".hmpdf-object-html").html($(".hmpdf-screen-modaleditor .editor").html());
			});
		});
	});
    }

    function makeDraggable($obj){
	$.fn.hmpdf.area.prepend($obj);
	$(".hmpdf-isdraggable").draggable();
	$(".hmpdf-isdraggable").resizable();
    }

    function createBasicTool($toolsDiv, imgname){
	$objDivTool = $("<div>");
	$objDivTool.addClass("hmpdf-istool");
	$objDivTool.css("background", "url(img/" + imgname + ") no-repeat");
	$objDivTool.css({
		backgroundSize: 30,
		backgroundPositionX: "center",
		backgroundPositionY: "center"
	});
	$toolsDiv.append($objDivTool);
	return $objDivTool;
    }

    function createBasicObject(){
	var $objDivTool = $("<div>");
	$objDivTool.addClass("hmpdf-isdraggable");
	$objDivTool.addClass("hmpdf-isobject");
	return $objDivTool;
    }

    function createModal(){
	$overlay = $("<div/>");
	$overlay.css({
		width: "100%",
		height: "100%",
		position: "fixed",
		top: 0,
		left: 0,
		background: "#333",
		opacity: "0.5"
		
	});
	$("body").append($overlay);
	$obj = $("<div/>");
	
	$obj.addClass("hmpdf-screen-modaleditor");
	$obj.css({
		width: 500,
		position: "absolute",
		background: "white",
		top: "30%",
		left: "50%",
		padding: "10px"
	});
	$obj.css("transform", "translate(-50%, -50%)");
	$obj.css("z-index", "100");
	$obj.css("border-radius", "5px");
	$obj.html("<textarea class='hmpdf-texteditor'></textarea>");
	$("body").append($obj);

	$overlay.on('click', function () {
		$overlay.remove();
		$obj.remove();
	});
	$obj.show();
    }

    function createPDF(){
	getCanvas().then(function(_canvas){
		var img = _canvas.toDataURL("image/png"),
		_doc = new jsPDF('p', 'px', [495, 580]);
		_doc.addImage(img, 'JPEG', 20, 20);
		_doc.save('hmpdf-generated.pdf');
	});
    }
    
    function getCanvas(){
	var a4 = [ 595.28,  841.89];
	return html2canvas($.fn.hmpdf.area,{ imageTimeout:2000, removeContainer:true }); 

    }

 
}( jQuery ));
