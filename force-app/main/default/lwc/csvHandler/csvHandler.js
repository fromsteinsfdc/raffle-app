import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { loadScript } from 'lightning/platformResourceLoader';
import papaparse from '@salesforce/resourceUrl/papaparse';
import insertParticipants from '@salesforce/apex/RaffleAppController.insertParticipants';

const CSV_MIME_TYPE = 'text/csv';
const WRONG_FILE_TYPE_ERROR = 'Please upload a .csv file';

export default class CsvHandler extends LightningElement {
    @api title = 'CSV Files'
    @api dragHereMessage = 'Drop file here, or click to upload';
    //@api dragHereMessage = 'Drop file here';

    @track csvData;
    @track file;

    @track columns = [];

    resultsReceived = false;

    isLoading;

    get submitIsDisabled() {
        return !(this.checkRequiredFields() && this.resultsReceived);
    }

    /* LIFECYCLE CALLBACKS */

    connectedCallback() {
        loadScript(this, papaparse);
    }


    /* EVENT HANDLERS */
    handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        console.log('in handleDrop');
        event.dataTransfer.dropEffect = 'copy';
        let file = event.dataTransfer.files[0];
        if (file.type === CSV_MIME_TYPE) {
            this.file = file;
            //this.isLoading = true;
            this.processCSV();
        } else {
            this.showToast('Wrong File Type', WRONG_FILE_TYPE_ERROR, 'error');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleFileUploadClick() {
        this.template.querySelector('input[type="file"]').click();
    }

    handleFileUploadChange(event) {
        console.log('in handleFileUploadChange');
        let files = event.currentTarget.files;
        if (files && files[0]) {
            this.file = files[0];
            //this.isLoading = true;
            this.processCSV();
        } else {
            this.showToast('Error', 'There was an error uploading your file. This shouldn\'t really be possible, so I don\'t know what to tell you.', 'error');
        }
    }

    handleSubmit() {
        /*
        let requiredFields = ['nameColumn', 'numTicketsColumn', 'raffleName'];
        let allValid = true;
        let fields = {};
        for (let fieldName of requiredFields) {
            let field = this.template.querySelector('.' + field);
            if (!field.reportValidity()) { 
                allValid = false; 
            }
            fields[fieldName] = field.value;
        }
        if (!allValid) {
            return;
        }

        let participants = [];
        for (let participant of this.csvData) {
            participants.push({
                name: participant[fields.nameColumn.value],
                numTickets: participant[fields.numTicketsColumn.value]
            })
        }
        let request = {
            name: fields[raffleName],
            participants: participants
        }
        //insertParticipants({ participantsString: JSON.stringify(participants) })
        let allFieldsCompleted = true;
        let nameColumn = this.template.querySelector('.nameColumn');
        allFieldsCompleted = nameColumn.reportValidity() && allFieldsCompleted;
        let numTicketsColumn = this.template.querySelector('.numTicketsColumn');
        allFieldsCompleted = numTicketsColumn.reportValidity() && allFieldsCompleted;
        let raffleName = this.template.querySelector('.raffleName');
        allFieldsCompleted = raffleName.reportValidity() && allFieldsCompleted;
        */
       //console.log('in handleSubmit');
       //console.log(this.template.querySelector('lightning-input'), this.template.querySelector('lightning-input').hasAttribute('required'), this.template.querySelector('lightning-input').attributes);
       //console.log(this.template.querySelector('lightning-input').attributes.length);
       //let attrs = this.template.querySelector('lightning-input').attributes;
       //for (let attr of this.template.querySelector('lightning-input').attributes) {
        //for (let i=0; i<attrs.length; i++) {
           //console.log(attrs[i].name, attrs[i].value);
       //}
        //this.template.querySelector('[required]').value = 'Test';
        let allFieldsCompleted = true;        
        //let requiredFields = this.template.querySelectorAll('.required');
        for (let requiredField of this.template.querySelectorAll('.req')) {
            allFieldsCompleted = requiredField.reportValidity() && allFieldsCompleted;
        }
        console.log('allFieldsCompleted = '+ allFieldsCompleted);
        if (!allFieldsCompleted) {
            return;
        }
        this.isLoading = true;

        let participants = [];
        for (let participant of this.csvData) {
            participants.push({
                name: participant[this.getEl('.nameColumn').value],
                numTickets: participant[this.getEl('.numTicketsColumn').value]
            })
        }
        console.log('participants.length = '+ participants.length);
        
        insertParticipants({ raffleName: this.getEl('.nameColumn').value, participantsString: JSON.stringify(participants) })
            .then(result => {
                this.showToast('Success!', 'Raffle saved successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error Saving Raffle', 'There was an error saving your raffle. Please make sure that "Name" is mapped to a text column and "Number of Tickets" is mapped to a numeric (integer) column.', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    /* ACTION METHODS */
    processCSV() {
        let file = this.file;
        console.log('in processCSV');
        console.log('file ' + file.name + ' = ' + JSON.stringify(file));
        this.isLoading = true;
        Papa.parse(file, {
            complete: (results, file) => {
                if (results.data) {
                    console.log('found results.data');
                    this.resultsReceived = true;
                    this.csvData = results.data;
                    this.columns = [];
                    for (let field of results.meta.fields) {
                        this.columns.push({
                            label: field,
                            fieldName: field,
                            type: 'text',
                            value: field // this is used for the comboboxes
                            //editable: true
                        });
                    }
                    this.isLoading = false;
                    /*
console.log('about to call apex');
this.isLoading = false;
addKnowledgeUserCSV({ usersString: JSON.stringify(results.data) }).then(result => {
    console.log('result: ' + JSON.stringify(result));
    this.isLoading = false;
}).catch(error => {
    console.log('error: ' + JSON.stringify(error));
    this.showToast('Error calling apex', 'Error: '+ JSON.stringify(error), 'error');
});
*/

                } else {
                    console.log('results.data are null');
                    this.isLoading = false;
                }
            },
            error: (error, file) => {
                this.showToast('Error parsing file', 'Error: ' + JSON.stringify(error), 'error');
                this.isLoading = false;
            },
            header: true
        });
    }

    clearFile() {
        this.resultsReceived = false;
        this.csvData = null;
        this.columns = [];
    }



    /* UTILITY METHODS */
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    checkRequiredFields(showErrors) {
        let allFieldsCompleted = true;        
        for (let requiredField of this.template.querySelectorAll('.req')) {
            console.log('in a required field');
            if (showErrors)
                allFieldsCompleted = requiredField.reportValidity() && allFieldsCompleted;
            else
                allFieldsCompleted = requiredField.checkValidity() && allFieldsCompleted;
        }
        console.log('allFieldsCompleted = '+ allFieldsCompleted);
        return allFieldsCompleted;
    }

    getEl(selector) {
        return this.template.querySelector(selector);
    }
}