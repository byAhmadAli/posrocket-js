function _isEmpty(obj) {
  for(let prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return JSON.stringify(obj) === JSON.stringify({});
};
function _getFormattedDate(theDate) {
  var monthNames = ["January", "February", "March", "April", 
    "May", "June","July", "August", "September", "October", 
    "November", "December"];
  var date = new Date(theDate);
  var month = (1 + date.getMonth()).toString();
  var day = date.getDate().toString();
  return monthNames[month] + ' ' + day;
};

let posrocket = function(){
  this.method = null;
  this.url = null;
  this.businessID = null
  this.transactionID = null;
  this.receiptID = null;
  this.serialNumber = null;

  let script = document.querySelector('script[class="posrocket-js"]');

  if(!_isEmpty(script.dataset)){
    this.method = script.dataset.method;
    this.url = script.dataset.url;
    this.businessID = script.dataset.businessId;
    this.transactionID = script.dataset.transactionId;
    this.receiptID = script.dataset.receiptId;
    this.serialNumber = script.dataset.serialNumber;
  }else{
    this.method = arguments[0];

    if ((typeof arguments === 'object') && (typeof arguments[1]  === 'object')) {
      this.url = arguments[1].url;
      this.businessID = arguments[1].businessId;
      this.transactionID = arguments[1].transactionId;
      this.receiptID = arguments[1].receiptId;
      this.serialNumber = arguments[1].serialNumber;
    }
  }
  

  if(!this.url) {
    console.warn('Please make sure that you add the url(Rest API).');
    return;
  }

  this.valid = false;

  this.init();
}

posrocket.prototype = {
  getJSON : function() {
    
    return new Promise(function(resolve, reject) { 
      let xhr = new XMLHttpRequest(); 
      xhr.open('get', this.url, true); 
      xhr.responseType = 'json';
      xhr.timeout = 10000;
      xhr.onprogress = function(e){
        if (e.lengthComputable){
          let percentage = Math.round((e.loaded/e.total)*100);
          console.log(percentage + '%' );
        }else{
          console.warn("Unable to compute progress information since the total size is unknown");
        }
      };
      xhr.ontimeout = function (e) {
        xhr.abort();
        return;
      };
      xhr.onload = function() { 
        let status = xhr.status; 
        if (status == 200) {
          if(xhr.response){
            let Data = xhr.response.data;
            if(_isEmpty(Data)){
              console.warn('File has not data.')
              xhr.abort();
              return;
            }else{
              resolve(xhr.response);
            }
          }else{
            console.warn('File is empty. no response!')
          }
        } else { 
          reject(status); 
          xhr.abort();
          return;
        } 
      }
      xhr.send(); 
    }.bind(this));

  },

  fetchData: function(Data){

    let receiptID = document.getElementsByClassName('receipt_id');
    for (var i = 0; i < receiptID.length; i++) {
      receiptID[i].innerHTML = Data.receipt_id;
    }
    
    let amount = document.getElementsByClassName('amount');
    for (var i = 0; i < amount.length; i++) {
      amount[i].innerHTML = Data.total_collected_money.amount;
    }

    let currency = document.getElementsByClassName('currency');
    for (var i = 0; i < currency.length; i++) {
      currency[i].innerHTML = Data.total_collected_money.currency;
    }

    let date = document.getElementById('date');
    date.innerHTML = Data.creation_time;
    let formattedDate = document.getElementById('formattedDate')
    formattedDate.innerHTML = _getFormattedDate(Data.creation_time);

    let issuer = document.getElementById('issuer');
    issuer.innerHTML = Data.creator.name;

    let itemization = document.getElementById('itemization');
    itemization.innerHTML = Data.itemization[0].name;

    let transactionID = document.getElementById('transactionID');
    transactionID.innerHTML = Data.transaction_id;

  },

  validate: function(Data){
    if(this.transactionID ===  Data.transaction_id && this.businessID === Data.business_id &&
      this.receiptID === Data.receipt_id && this.serialNumber === Data.serial_number){
      this.fetchData(Data);
    }else{
      console.warn('not valid!')
    }
  },

  init: function(){

    if(this.method == 'get'){

      this.getJSON().then(function(data) {
        let Data = data;
        this.validate(Data);
      }.bind(this));
    }else{
      console.warn('Please make sure that name of method is exsist. Follow the documantation!')
    }

  }

};