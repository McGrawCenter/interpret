jQuery(document).ready(function(){




	var items = [];
	var current = {};
	var tilesources = [];
	var overlay = false;
	var selectionMode = false;
	var currentimg = "";
	var newcurrentimg = false;
	var messages = [];

	initViewer();

	jQuery("#add-manifest-form").submit(function(event) {
	  var manifest = jQuery('#manifest').val();
	  jQuery('#gallery').empty();
	  parse(manifest);
	  event.preventDefault();
	  jQuery("#add").val("");
	});



	// load example manifests
	jQuery(".example").click(function(event){
	  var manifest = jQuery(this).attr('data-manifest');
	  console.log(manifest);
	  jQuery('#gallery').empty();
	  parse(manifest);
	  event.preventDefault();
	  jQuery("#add").val("");	  
	});







	/*************************
	* activate or de-activate crop mode
	***********************************/

	jQuery('#crop').click( function() {  

	  if(jQuery("#crop").hasClass("activated")) { 
	    jQuery("#crop").removeClass("activated");
	    selectionMode = false;
	    viewer.setMouseNavEnabled(true);
	  }
	  else { 
	    jQuery("#crop").addClass("activated");
	    selectionMode = true;
	    viewer.setMouseNavEnabled(false);
	  }
	  
	}); 


	jQuery("#sendchat").submit(function(e){
	  e.preventDefault();
	  var txt = jQuery();
	  chat();
	  jQuery("#chat").val("");
	});	
	    

	jQuery(document).on("click",".tile",function(){
	  console.log(items);
	  var index = jQuery(this).attr('data-index');
	  setCanvas(index);
	  
	});

	function parse(manifest) {

		items = [];
		const vault = new IIIFVault.Vault();
		vault.loadManifest(manifest).then(async (m) => {

		    m.items.forEach(function(item,i) {
			var x = vault.get(item);
			var x1 = vault.get(x.items[0]);
			var x2 = vault.get(x1.items[0]);
			var x3 = vault.get(x2.body[0]);
			if(typeof x3.service[0]['@id'] !== undefined) { var service = x3.service[0]['@id']; }
			else { var service = x3.service[0]['id']; } 
			service = service.replace(' ', '%20');
			tilesources.push(service + "/info.json");
			let random = (Math.random() + 1).toString(36).substring(2);
			var o = {
			    'id': random,
			    'index': i,
			    'service': service,
			    'rotation': 0,
			    'canvas': item.id
			};    
			items.push(o);            
		    }); /* end fetch */


		}).then(data => {
		    drawGallery();
		    current_index = 0;
		    first_canvas = Object.keys(items)[0];
		    setCanvas(first_canvas); 		
		
		});	
	}
	
	
	function drawGallery() {
	  items.forEach((item, index) => {	    
	    jQuery("#gallery").append(tileTemplate(index, item));
	    
	  });
	}
		
	function tileTemplate(i,o) {
	  var src = o.service + "/full/300,/0/default.jpg";
	  var html = "<div data-index='"+i+"' class='tile'><img src='"+src+"'/></div>";
	 return html;
	}
	
	function setCanvas(id) {
	        current = items[id];

	        // open image in OSD -----------------------------------
	        viewer.open(current.service + '/info.json');
	        var preview_image = current.service + "/full/,400/0/default.jpg";
	        jQuery("#preview").attr('src',preview_image);
	        currentimg = preview_image;
	        newcurrentimg = true;
	}  


	    function initViewer() {

		    viewer = OpenSeadragon({
			id: 'viewer',
			showNavigator: false,
			showRotationControl: true,
			prefixUrl: 'assets/js/openseadragon/images/',
			tileSources: [tilesources[0]]
		    });

		    viewer.addHandler('rotate', function() {
			current.rotation = viewer.viewport.getRotation();
			if (current.rotation < 0) {
			    current.rotation = 360 + current.rotation;
			}
		    });
		    
		    
		    // draw overlays

		    new OpenSeadragon.MouseTracker({

			element: viewer.element,
			keyHandler: function(event) {
			    console.log(event);
			},
			pressHandler: function(event) {

			    current.service = viewer.source['@id'];

			    if (!selectionMode) {
			        return;
			    }

			    if (overlay) {
			        viewer.removeOverlay("overlay");
			    }
			    var overlayElement = document.createElement("div");
			    overlayElement.id = "overlay";
			    overlayElement.className = "highlight";
			    var viewportPos = viewer.viewport.pointFromPixel(event.position);
			    viewer.addOverlay({
			        element: overlayElement,
			        location: new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0)
			    });
			    overlay = true;
			    drag = {
			        overlayElement: overlayElement,
			        startPos: viewportPos
			    };

			},
			dragHandler: function(event) {

			    if (typeof drag === 'undefined') {
			        return;
			    }

			    var viewportPos = viewer.viewport.pointFromPixel(event.position);

			    var diffX = viewportPos.x - drag.startPos.x;
			    var diffY = viewportPos.y - drag.startPos.y;


			    var location = new OpenSeadragon.Rect(
			        Math.min(drag.startPos.x, drag.startPos.x + diffX),
			        Math.min(drag.startPos.y, drag.startPos.y + diffY),
			        Math.abs(diffX),
			        Math.abs(diffY)
			    );

			    var overlayHeight = jQuery("#overlay")[0].clientWidth;

			    // to get the image width, it would be better to
			    //  get the info.json file
			    // but we can also get it from the viewer
			    // we just have to account for rotation
			    if( current.rotation == 0 | current.rotation == 180 ) { var w = viewer.viewport._contentSize.x; }
			    else { var w = viewer.viewport._contentSize.y; }

			    current.region = [
			        Math.floor(location.x * w),
			        Math.floor(location.y * w),
			        Math.floor(location.width * w),
			        Math.floor(location.height * w)
			    ]
			    


			    // if the box goes outside the boundaries of the image
			    jQuery.each(current.region, function(i, v) {
			        if (v < 0) {
			            current.region[i] = 0;
			        }
			    });

			    viewer.updateOverlay(drag.overlayElement, location);

			    //console.log(current.region);
			},
			releaseHandler: function(event) {

			    if (selectionMode == true) {


			        // add info to the selections array
			        // creating an id would probably be good
			        //var selection_index = selections.push({"id":"", "manifest":manifest_url,"detail":crop_url,"html":img_html, "full":uncropped_url, "mode": "detail"})-1;

			        //console.log(selections);

			        // if any items in the tray are currently active, remove active class
			        jQuery(".preview-item.active-item").removeClass('active-item');

			        var img = current.service + "/" + current.region.join(',') + "/300,/"+current.rotation+"/default.jpg";

			        currentimg = img;
			        newcurrentimg = true;
			        
			        jQuery("#preview").attr('src', img);
			        

			        jQuery("#manifest-annotator-add-manifest").val(manifest);
			        jQuery("#manifest-annotator-add-canvas").val(current.canvas);
			        jQuery("#manifest-annotator-add-service").val(current.service);
			        jQuery("#manifest-annotator-add-region").val(current.region.join(','));
				 jQuery("#manifest-annotator-add-rotation").val(current.rotation);
			        jQuery("#crop").removeClass("activated");
			        selectionMode = false;
			        viewer.setMouseNavEnabled(true);
			        if (overlay) {
			            viewer.removeOverlay("overlay");
			        }

				//chat();

			    }

			    drag = null;

			}
		    });		    
			    

	    } // end init viewer
		    

		    
	/************************************
	* Send messages
	******************************/


	function chat() {

	    //jQuery("#output").empty();
	    //jQuery("#output").prepend("<img src='assets/images/wait.gif' style='margin:10% 40%;'/>");

	    var sModelId = "gpt-4o-mini";
	    //messages.push({"role": "user", "content": inputstr});
	    
	    var prompt = jQuery("#chat").val();
	    if(prompt == "") { prompt = "What is in this image?"; }
	    // add user prompt to the output
	    
	    
	    if(newcurrentimg == true) {
	         var bubble = "<div class='user-bubble-img'><a href='"+currentimg+"' target='_blank'><img src='"+currentimg+"' style='height:120px;float:left;margin:0 1em 1em 0'/></a></div><div class='user-bubble'>"+prompt+"</div>";
		  newcurrentimg = false;
	     }
	     else {
		 var bubble = "<div class='user-bubble'>"+prompt+"</div>";
	     }
	    
	    
	    jQuery("#output").prepend(bubble);
	    
	    var imgurl = jQuery("#preview").attr('src');

	    var d = {"prompt":prompt, "imgurl": imgurl}
	    
	    jQuery.post('fetch.php', d, function(response){
	        console.log(response);

		 var bubble = "<div class='bot-bubble'>"+response.response+"</div>";
		
		jQuery("#output").prepend(bubble);		  
	    });
 

	}	





	/**************** copy ****************/
	
	function SelectText(element) {
	  var doc = document;
	  if (doc.body.createTextRange) {
	    var range = document.body.createTextRange();
	    range.moveToElementText(element);
	    range.select();
	  } else if (window.getSelection) {
	    var selection = window.getSelection();
	    var range = document.createRange();
	    range.selectNodeContents(element);
	    selection.removeAllRanges();
	    selection.addRange(range);
	  }
	}
	jQuery(document).on("click",".copyable",function(e) {
	  var containerDiv = jQuery("#output");
	  //Make the container Div contenteditable
	  containerDiv.attr("contenteditable", true);
	  //Select the image
	  SelectText(containerDiv.get(0));
	  //Execute copy Command
	  //Note: This will ONLY work directly inside a click listener
	  document.execCommand('copy');
	  //Unselect the content
	  window.getSelection().removeAllRanges();
	  //Make the container Div uneditable again
	  containerDiv.removeAttr("contenteditable");
	  //Success!!
	  console.log("image copied!");
	});	




});


