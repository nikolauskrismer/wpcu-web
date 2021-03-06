$(document).ready(function() {
	var config;
	refreshCaptions();
	window.setInterval(refreshValues, 60000);
	$( "#datetimepicker" ).datetimepicker({
		dateFormat: 'yy-mm-dd',
		timeFormat: 'HH:mm',
		onSelect: function (dateTime, inst) {
			refreshValues();
		}
	});
	$('.timepicker').timepicker({
		timeFormat: 'HH:mm',
		onClose: function (time, inst) {
			$.ajax({
				type: 'POST',
				url: '/heating/save',
				data: {'id': this.id,
						'value': time,
						'oldValue': inst.lastVal,
				},
				cache: false,
				success: function() {
					alert("Submitted");
				}
			});
		}
	});
	$('.datepicker').datetimepicker({
		dateFormat: 'dd.mm.yy',
	});
	$('.edit').editable('/heating/save', {
		indicator: 'Saving...',
		tooltip: 'Click to edit...',
		contentType: 'application/json; charset=utf-8',
		"submitdata": function (value, settings) {
		      return {
		           "oldValue": this.revert
		      };
		 },
		 callback: function (value, settings) {
			 // Decode utf8
			 this.innerHTML=jQuery.parseJSON(value);
		 }
	});
	$("#tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
	$("#tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");
	
});

function refreshCaptions() {
	console.log("Retrieve description json string");
	$.ajax({
		url: "/heating/getConfig",
		type: "GET",
		dataType: "json",
		success: function(json) {
			updateCaptions(json);
			refreshValues();
		}
	});
}

function updateCaptions(json) {
	console.log("Update captions");
	for(var key in json) {
		if(json[key]["caption"]) {
			$("#"+key+" #description").html(json[key]["caption"]);
		}
		if(json[key]["webcaption"]) {
			$("#"+key+" #description_short").html(json[key]["webcaption"]);
		}
	}
	config=json;
}

function refreshValues() {
	var dateTime= $( "#datetimepicker").val();
	console.log("date:" + dateTime);
	var url = "/heating/get";
	url+= dateTime ? ("/"+dateTime):"";
	$.ajax({
		// the URL for the request
		url : url,
		// the data to send (will be converted to a query string)
		// whether this is a POST or GET request
		type : "GET",
		// the type of data we expect back
		dataType : "json",
		// code to run if the request succeeds;
		// the response is passed to the function
		success : function(json) {
			updateValues(json);
		},
		// code to run if the request fails; the raw request and
		// status codes are passed to the function
		error : function(xhr, status) {
			alert("Could not retrieve data for selected date/time!");
		},
		// code to run regardless of success or failure
		complete : function(xhr, status) {
			//alert("The request is complete!");
		}
	});

	
}

function updateValues(json) {
	for(var key in json) {
		if(json[key].date) {
			time=json[key].date;
			if($("#"+key+" #"+key).hasClass('date') || $("#"+key+" #"+key).hasClass('datepicker')) {
				time=time.substr(0,10);
			} else if($("#"+key+" #"+key).hasClass('time') || $("#"+key+" #"+key).hasClass('timepicker')) {
				time= time.substr(11,5);
			}
			if($("#"+key+" #"+key).hasClass('hasDatepicker') || $("#"+key+" #"+key).hasClass('hasTimepicker')) {
				$("#"+key+" #"+key).timepicker('setTime', time);
			} else {
				$("#"+key+" #"+key).html(time);
			}
		} else {
			// check if we should formate it
			if(config[key]['format']) {
				json[key]=sprintf(config[key]['format'],json[key]);
			}
			if(config[key]['unit']=='%') {
				json[key]*=100;
			}
			if(config[key]['unit']) {
				json[key]=json[key]+config[key]['unit'];
			}
			$("#"+key+" #"+key).html(json[key]);
		}
	}
	if(json.heatreturntemp) {
		$("#heatreturntemp2 #heatreturntemp2").html(json.heatreturntemp);
	}
	
	if(json.operatingstate & 0x1) { // warmwasser
		$("#icondomesticwater img").attr("src", "/img/hw_32x32_active.ico");
	} else {
		$("#icondomesticwater img").attr("src", "/img/hw_32x32_inactive.ico");
	}
	if(json.operatingstate & 0x2) { // heizen
		$("#iconheating img").attr("src", "/img/heat_32x32_active.ico");
	} else {
		$("#iconheating img").attr("src", "/img/heat_32x32_inactive.ico");
	}
	if(json.operatingstate & 0x4) { // beckenwasser
		$("#iconpool img").attr("src", "/img/pool_32x32_active.ico");
	} else {
		$("#iconpool img").attr("src", "/img/pool_32x32_inactive.ico");
	}
	if(json.operatingstate & 0x8) { // naturkühlung
		$("#iconcooling img").attr("src", "/img/cool_32x32_active.ico");
	} else {
		$("#iconcooling img").attr("src", "/img/cool_32x32_inactive.ico");
	}
	if(json.operatingstate & 0x10) { // kompressor aktiv
		$("#iconcompressor1 img").attr("src", "/img/refrig_0_g_.ico");
	} else {
		$("#iconcompressor1 img").attr("src", "/img/refrig_0rgb.ico");
	}
	if(json.operatingstate & 0x20) { // stufe 2
	} else {
	}
	if(json.operatingstate & 0x40) { // solar
	} else {
	}
	

	if(json.dobuffer & 0x1) { // kompressor 1
	}
	if(json.dobuffer & 0x2) { // kompressor 2
	}
	if(json.dobuffer & 0x4) { // heizungspumpe
		$("#iconpumpheating img").attr("src", "/img/pump_180_g_.ico");
	} else {
		$("#iconpumpheating img").attr("src", "/img/pump_180rgb.ico");
	}
	if(json.dobuffer & 0x8) { // magnetventil
		$("#iconmagnetvalve img").attr("src", "/img/valve_magn_0_g_.ico");
	} else {
		$("#iconmagnetvalve img").attr("src", "/img/valve_magn_0rgb.ico");
	}
	if(json.dobuffer & 0x10) { // alarm
	} else {
	}
	if(json.dobuffer & 0x20) { // motorventil naturkühlung
	} else {
	}
	if(json.dobuffer & 0x40) { // motorventil warmwasser
	} else {
	}
	if(json.dobuffer & 0x80) { // pumpe quelle
		$("#iconpumpheatsource img").attr("src", "/img/pump_90_g_.ico");
	} else {
		$("#iconpumpheatsource img").attr("src", "/img/pump_90rgb.ico");
	}
	if(json.dobuffer & 0x100) { // ventil pool
	} else {
	}
	if(json.dobuffer & 0x200) { // solarbetrieb
	} else {
	}

	if(json.dibuffer & 0x1) { // externe abschaltung
	}
	if(json.dibuffer & 0x2) { // sm kompressor 2 / stufe 2
	}
	if(json.dibuffer & 0x4) { // freigabe beckenwasser
	}
	if(json.dibuffer & 0x8) { // sm phasedrehfeld
	}
	if(json.dibuffer & 0x10) { // sm pumpe quelle
	}
	if(json.dibuffer & 0x20) { // sm hd pressostat
	}
	if(json.dibuffer & 0x40) { // sm nd pressostat
	}
	if(json.dibuffer & 0x80) { // sm kompressor 1
	}

}
