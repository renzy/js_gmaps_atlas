var atlas = {
	config: {
		mapTypeId: 'roadmap',
		zoom: 12,
		center: false,
		zoomControl: true,
		panControl: false,
		streetViewControl: false,
		navigationControl: false,
		mapTypeControl: false,
		scaleControl: false,
		draggable: false,
		scrollwheel: false,
		disableDoubleClickZoom: true,
		styles: []
	},

	status: 0,
	error: false,
	data: [],

	init: function(key){
		if(typeof google=='undefined') this.error = 'google undefined';
		else if(typeof key=='undefined') this.error = 'google maps api key required';

		if(this.error){
			console.log(this.error);
			return;
		}

		try {
			if(typeof navigator!=='undefined' && typeof navigator.userAgent!=='undefined' && !/mobile|android|ip(hone|[ao]d)|blackberry|tablet/gi.test(navigator.userAgent)){
				this.config.disableDoubleClickZoom = false;
				this.config.panControl = this.config.draggable = true;
			}
		} catch(err){
			console.log('atlas user_agent error');
			console.log(err);
		}
		
		google.load('maps','3',{
			other_params: 'libraries=geometry&key='+key,
			callback: this.callback
		});
	},

	callback: function(){
		window.atlas.status = 1;
		window.atlas.draw_maps();
	},

	draw_maps: function(){
		if(this.status<=0) return;

		var _this = this, set = document.querySelectorAll('.atlas-map');
		for(var x=0; x<set.length; x++){
			var map, marker = false, id = 0, options = {}, ele = set[x];

			for(var y in this.config){
				if(ele.getAttribute(y)==null){
					options[y] = this.config[y];
					continue;
				}
				if(y=='center'){
					var coords = ele.getAttribute(y).split(',');
					options[y] = new google.maps.LatLng({
						lat: parseFloat(coords[0]),
						lng: parseFloat(coords[1])
					});
				} else options[y] = parseInt(ele.getAttribute(y));
			}
			if(typeof options.center!=='object') continue;
			map = new google.maps.Map(ele,options);
			

			if(ele.getAttribute('marker')=='1'){
				marker = new google.maps.Marker({
					position: map.getCenter(),
					map: map,
					clickable: false,
					content: false,
					visible: false
				});
			}

			map.id = this.data.length;
			this.data.push({
				map: map,
				marker: [marker]
			});

			if(ele.getAttribute('offset')!==null){
				google.maps.event.addListenerOnce(map,'bounds_changed',function(){
					var offset = {
						lat: this.getCenter().lat(),
						lng: this.getCenter().lng()
					};

					offset.lng = this.getBounds().getNorthEast().lng() - (parseInt(this.getDiv().getAttribute('offset')) / 100) * ((this.getBounds().getNorthEast().lng() - offset.lng) * 2);

					this.panTo(new google.maps.LatLng(offset.lat,offset.lng));
					for(var x=0; x<_this.data[this.id].marker.length; x++)
						_this.data[this.id].marker[x].setVisible(true);
				});
			} else {
				if(marker) marker.setVisible(true);
			}
		}
	}
};
