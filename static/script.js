
(function(toastr, FACE_API_KEY, FACE_LIST_ID){
	'use strict';
	var hud = document.getElementById('hud');
	var video = document.getElementById('video');
	var videoSelect = document.getElementById('videoselect');
	var snapButton = document.getElementById("snap");
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var faceEndpoint = 'https://westus.api.cognitive.microsoft.com/face/v1.0'
	var faceKey = FACE_API_KEY;
	var faceListId = FACE_LIST_ID;
	var DETECT = '/detect?returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses'
	var FIND_SIMILARS = '/findsimilars';
	var GET_FACE_LIST = '/facelists/' + faceListId;
	var CHECK_CUSTOMER = '/customerinbar';
	var faceIds = [1,2]

	toastr.options = {
	  "positionClass": "toast-bottom-right",
	  "newestOnTop": true
	}

	snapButton.addEventListener('click', function(){
		context.drawImage(video, 0, 0, 640, 480);
		checkFace();
	})

	navigator.mediaDevices.getUserMedia({video:true})
			.then(getDeviceInfos);

	videoSelect.onchange = function(){
		navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:videoSelect.value}}})
			.then(gotStream);
	}

	function checkFace(){
		toastr.info('Checking face...');
		hud.className = "off";
		var req = createRequest(DETECT, 'POST', function(){
			var res = JSON.parse(this.responseText)
			console.log(res);
			if(res && res.length){
				var face = res[0]
				faceIds[0] = face.faceId;
				var age = face.faceAttributes.age;
				if(age >= 18){
					toastr.success('You look old enough to buy beer you lucky dog', 'Age guess: ' + face.faceAttributes.age, {timeOut: 10000});
				} else {
					toastr.warning('Are you sure you are old enough to drink?', 'Age guess: ' + face.faceAttributes.age, {timeOut: 10000});
				}
				checkSimilarFaces(face.faceId);
				
			} else {
				toastr.error('No face detected, please try again');
				hud.className = "";
			}

			
		});
		req.setRequestHeader('Content-Type', 'application\/octet-stream')

		var blob = makeBlob(canvas.toDataURL());
		req.send(blob);
	}

	function checkOrders(customerId){
		var newReq = new XMLHttpRequest();
		newReq.open('POST', CHECK_CUSTOMER + '?id=' + encodeURIComponent(customerId), true)
		newReq.addEventListener('load', function(){
			var res = JSON.parse(this.responseText)
			console.log(res)
			console.log(customerId)
			if(res === customerId){
				toastr.success('We have your order! Pouring now...');
			} else {
				toastr.error('No order found')
			}
			hud.className = "";
		})
		newReq.setRequestHeader('Content-Type', 'application\/json')
		newReq.send();

	}

	function checkFaceList(id){

		var newReq = createRequest(GET_FACE_LIST, 'GET', function(){
			var res = JSON.parse(this.responseText);
			console.log(res);
			var filteredList = res.persistedFaces.filter(function(val){
				return val.persistedFaceId === id;
			})
			if(filteredList.length){
				checkOrders(filteredList[0].userData);
			} else {
				toastr.error('Sorry, found no orders.')
				hud.className = "";
			}
			
		});
		newReq.setRequestHeader('Content-Type', 'application\/json')
		newReq.send();

	}

	function checkSimilarFaces(faceId){
		var newReq = createRequest(FIND_SIMILARS, 'POST', function(){
			var res = JSON.parse(this.responseText);
			console.log(res);
			var mostConfidentHit = res[0];
			if(mostConfidentHit.confidence > 0.5){
				toastr.info('Face looks familiar, checking orders...')
				checkFaceList(mostConfidentHit.persistedFaceId);
			} else {
				toastr.error('Found no matching faces in our orders.');
				hud.className = "";
			}

		});
		newReq.setRequestHeader('Content-Type', 'application\/json')
		newReq.send(JSON.stringify({
			faceId: faceId,
			faceListId: faceListId,
			mode: 'matchFace'
		}))
	}

	function getDeviceInfos(){
		navigator.mediaDevices.enumerateDevices()
			.then(function(deviceInfos){
				var videoInfos = deviceInfos.filter(function(val){
					return val.kind === 'videoinput'
				})
				
				videoInfos.forEach(function(deviceInfo){
					if (deviceInfo.kind === 'videoinput') {
						var option = document.createElement('option');
						option.value = deviceInfo.deviceId;
						option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
						videoSelect.appendChild(option);
						
					}
				})
				videoSelect.value = videoInfos[videoInfos.length-1].deviceId;
				videoSelect.onchange();

			});	
	}

	function gotStream(stream) {
		window.stream = stream; // make stream available to console
		video.srcObject = stream;
		video.play();
		// Refresh button list in case labels have become available
	}

	function createRequest(url, method, cb){
		var req = new XMLHttpRequest();
		req.open(method, faceEndpoint+url,true)
		
		req.setRequestHeader('Ocp-Apim-Subscription-Key', faceKey)
		req.addEventListener('load', cb)
		return req		
	}

	function makeBlob(dataURL) {
		var BASE64_MARKER = ';base64,';
		if (dataURL.indexOf(BASE64_MARKER) == -1) {
			var parts = dataURL.split(',');
			var contentType = parts[0].split(':')[1];
			var raw = decodeURIComponent(parts[1]);
			return new Blob([raw], { type: contentType });
		}
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(':')[1];
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;

		var uInt8Array = new Uint8Array(rawLength);

		for (var i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}

		return new Blob([uInt8Array], { type: contentType });
	}

	var throttle = function(type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
             requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");

})(toastr, FACE_API_KEY, FACE_LIST_ID)
