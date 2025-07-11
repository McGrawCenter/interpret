<?php
// SSO / CAS / etc.
?><!DOCTYPE html>
<html lang="en">
<head>

  <!-- Basic Page Needs
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta charset="utf-8">
  <title>IIIF Chat</title>
  <meta name="description" content="">
  <meta name="author" content="">

  <!-- Mobile Specific Metas
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <script type="text/javascript" src="assets/js/jquery.min.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@iiif/vault@latest/dist/index.umd.js?ver=6.6.1" id="canvaspanel-js"></script>
  <script type="text/javascript" src="assets/js/openseadragon/openseadragon.min.js?ver=6.6.1" id="openseadragon-js"></script>


  <!-- CSS
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="stylesheet" href="assets/css/normalize.css">
  <link rel="stylesheet" href="assets/css/skeleton.css">
  <link rel="stylesheet" href="assets/css/style.css">



</head>
<body>

  <!-- Primary Page Layout
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <div class="container-fluid">
    
    <div class="row">
      <div class="twelve columns" style="margin-top: 1%">
        <form id="add-manifest-form" style='position:relative;margin-bottom:0px;'>
        <input type='text' name='manifest' id='manifest' class='' style='width:100%' value="https://cudl.lib.cam.ac.uk//iiif/PR-CCF-00046-00036"/>
        <button type="submit" class='btn' id='add' style='position:absolute;top:0px;right:0px;'>Add</button>
        </form>
      </div>
    </div>

    <div class="row">
      <div class="seven columns" style="margin-top: 1%">
	<div id='viewer-wrap' style='margin-top:0px;position:relative;'>
	  <div id='viewer' data-manifest='{manifest}' class='openseadragon' style='height:571px;width:100%;background:black;'></div>
	  <button id="crop"><img src="assets/images/crop.svg" style="height:42px;"></button>
	</div>
	
        <div id="gallery-frame">
          <div id="gallery"></div>
        </div>	
	
      </div>
      <div class="five columns" style="margin-top: 1%;margin-left:1%;">
     

         <form id="sendchat" style='display:flex;flex-direction:column;margin-bottom:0px;'>
           <div id="preview-window" style="text-align:center;">
           <img id="preview" src="" style="max-height:220px; max-width:220px;"/>
           </div>
           <textarea id='chat' style='width:100%;margin-bottom:0px;' rows='2'>What's in this picture?</textarea>
           <input type='submit' class='btn' style='background:cadetblue;color:white;' value="Send" />
         </form>

        <div style='height:440px;overflow-y:scroll;'>
          <div id="output"></div>
          <button class="btn btn-primary copyable">Copy Conversation</button>
        </div>
        
      </div>      
    </div>    
  </div>

  <script src="assets/js/script.js?v=0.1"></script>
</body>
</html>
