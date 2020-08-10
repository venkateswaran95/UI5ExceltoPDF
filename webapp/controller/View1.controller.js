/*global console:true*/
/*global XLSX:true*/
/*global jsPDF:true*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"MyData/libs/jszip",
	"MyData/libs/xlsx",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"sap/m/PDFViewer"
], function(Controller,MessageToast,jszip,xlsx,	JSONModel,jQuery,PDFViewer) {
	"use strict";

	return Controller.extend("MyData.controller.View1", {
		onInit : function(){
				this._pdfViewer = new PDFViewer();
				this.getView().addDependent(this._pdfViewer);
		},
		handleUploadComplete: function(oEvent) {
		console.log("handleComplete");
			
		},

		handleUploadPress: function() {
		var that=this;
		console.log("handlePress");
		var oFileUploader = this.byId("fileUploader");
		var oFile = oFileUploader.oFileUpload.files[0];
    	var reader = new FileReader();

    	reader.onload = function(e) {
			var data = e.target.result;
    		var workbook = XLSX.read(data, {
        		type: 'binary'
    		});
			workbook.SheetNames.forEach(function(sheetName) {
			
        		var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        		//var json_object = JSON.stringify(XL_row_object,undefined,4);
        		//var sheet=XL_row_object;
        		
                var _pdfurl = that.convertToPDF(XL_row_object);
                that.popupPDF(_pdfurl,"My Expense Tracker");
             
			})
		};

    	reader.onerror = function(ex) {
    		console.log(ex);
    	};
		reader.readAsBinaryString(oFile);
		
			
		},
		// save and download json string as json file
		saveFile: function(text, filename){
			var a = document.createElement('a');
			a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(text));
			a.setAttribute('download', filename);
			a.click();
		},
		// convert JSON to PDF with jsPDF auto table
		convertToPDF: function(sheet){
			var total = sheet.reduce((sum,el)=>sum + parseInt(el.Amount),0);
        		var columns = ["Date and Time","Type","Amount","Date","Comments"];  
                var data = [], Vegetables=0, Others = 0, Petrol = 0, Others2=0, Grocery=0;  
                var i=0;
                    
                while(i<sheet.length) {  
                    	data[i]=[sheet[i].Timestamp,sheet[i]["Select type"],sheet[i].Amount,sheet[i].Date,sheet[i].Comments];
                        switch(sheet[i]["Select type"]){
                        	case "Vegetable":
                        		Vegetables+=parseInt(sheet[i].Amount);
                        		break;
                        	case "Others":
                        		Others+=parseInt(sheet[i].Amount);
                        		break;
                        	case "Transport & Petrol":
                        		Petrol+=parseInt(sheet[i].Amount);
                        		break;
                        	case "Grocery items":
                        		Grocery+=parseInt(sheet[i].Amount);
                        		break;
                        	default:
                        		Others2+=parseInt(sheet[i].Amount);
                        		break;
                        }
                        i+=1;
                    }  
               
    			
                var doc = new jsPDF('p', 'pt', 'a4' , true);  
                
              
               let footerHTML = "<h6> * Expense statements for "+ sheet[0].Date+"20 - "+ sheet[i-1].Date+"20</h6>";
               doc.fromHTML( footerHTML, 15, 10);
               
               footerHTML = "<h6>* Total = "+ total + " INR</h6>";
               doc.fromHTML( footerHTML, 15, 20);
               
               footerHTML = "<h6>* Petrol & Transport			= "+ Petrol + " INR</h6>";
               doc.fromHTML( footerHTML, 15, 30);
               
               footerHTML = "<h6>* Vegetables					= "+ Vegetables + " INR</h6>";
               doc.fromHTML( footerHTML, 15, 40);
               
               footerHTML = "<h6>* Grocery Items				= "+ Grocery + " INR</h6>";
               doc.fromHTML( footerHTML, 15, 50);
               
               footerHTML = "<h6>* Others ( Rent, Milk, Cable )	= "+ Others2 + " INR</h6>";
               doc.fromHTML( footerHTML, 15, 60);
               
               footerHTML = "<h6>* Miscellaneous				= "+ Others + " INR</h6>";
               doc.fromHTML( footerHTML, 15, 70);
               
               doc.autoTable(columns, data,{
                	"theme":"grid",
                	"startY":120
                });  
               
			
			   
                doc.setProperties({
                	"title":"My Expense Monthly Statement"
                });
               
                let dataSrc= doc.output("blob");
                return URL.createObjectURL(dataSrc);
			
		},
		popupPDF: function (sSource,sTitle) {
			jQuery.sap.addUrlWhitelist("blob");
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle(sTitle);
			this._pdfViewer.open();
		}

	});
});