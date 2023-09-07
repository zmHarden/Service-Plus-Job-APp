import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QLineEdit, 
  QDateEdit, QTextBrowser, QCalendarWidget, QDate, QDialog, WidgetEventTypes } from '@nodegui/nodegui';
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const prompt = require("prompt-sync")();

const win = new QMainWindow();
win.setWindowTitle("Service Plus Job Database");

const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);

const buttonCreate = new QPushButton();
buttonCreate.setText('Create a Job');
buttonCreate.addEventListener('clicked', async () => {

    const dialog = new QDialog();
    const dialogLayout = new FlexLayout()
    dialog.setLayout(dialogLayout);
    dialog.setWindowTitle("Create a Job");

    const labelPO1 = new QLabel();
    labelPO1.setObjectName("label");
    labelPO1.setText("PO #: ");

    const textBoxPO1 = new QLineEdit();

    const labelStore1 = new QLabel();
    labelStore1.setObjectName("label");
    labelStore1.setText("Store # (If PO starts with 35): ");

    const textBoxStore1 = new QLineEdit();

    const labelDate = new QLabel();
    labelDate.setObjectName("label");
    labelDate.setText("Date: ");

    const calendarWidgetCreate = new QCalendarWidget();
    const dateSelector = new QDateEdit();
    dateSelector.setCalendarPopup(true);
    dateSelector.setDate(QDate.currentDate());
    dateSelector.setCalendarWidget(calendarWidgetCreate);

    const labelBilled = new QLabel();
    labelBilled.setObjectName("label");
    labelBilled.setText("Amount Billed: ");

    const textBoxBilled = new QLineEdit();

    const submitButton = new QPushButton();
    submitButton.setText('Submit');
    submitButton.addEventListener('clicked', async () => {

      let inputPO = textBoxPO1.displayText();
      let poNum = null;
      let storeNum = null;
      let billedAmount = null;
      let date = null;
      
      if( /^\d*$/.test(inputPO) ) //Regex Checking if input contains only numbers
      {
        if(inputPO.length != 8)
        {
          displayJob.setText("Please enter valid PO number");
          return;
        }
        poNum = parseInt(inputPO);
      }
      else
      {
        displayJob.setText("PO number must contain only numbers. Please re-enter");
        return;
      }


      if(inputPO.substring(0, 2) === "35")
      {
        let inputStore = textBoxStore1.displayText()
        if(inputStore === "")
        {
          displayJob.setText("Please enter store number.");
          return;
        }

        if( /^\d*$/.test(inputStore) && ( inputStore === "6635" || inputStore === "0635" || inputStore === "635") )
        {
          storeNum = parseInt(inputStore);
        }
        else
        {
          displayJob.setText("Please enter valid store number");
          return;
        }
      }
      else
      {
        let ident = inputPO.substring(0, 3); //First three numbers tell us the store number
        if(ident === "224" || ident === "225"){storeNum = 622}
        else if(ident === "254" || ident === "255"){storeNum = 625}
        else if(ident === "274" || ident === "275"){storeNum = 627}
        else if(ident === "284" || ident === "285"){storeNum = 628}
        else if(ident === "304" || ident === "305"){storeNum = 630}
        else if(ident === "324" || ident === "325"){storeNum = 632}
        else if(ident === "394" || ident === "395"){storeNum = 639}
        else if(ident === "404" || ident === "405"){storeNum = 640}
        else if(ident === "424" || ident === "425"){storeNum = 642}
        else if(ident === "074" || ident === "075"){storeNum = 1007}
        else if(ident === "094" || ident === "095"){storeNum = 1009}
        else if(ident === "174" || ident === "174"){storeNum = 1017}
        else if(ident === "414" || ident === "415"){storeNum = 1041}
        else if(ident === "924" || ident === "925"){storeNum = 1092}
        else if(ident === "614" || ident === "615"){storeNum = 1861}
        else if(ident === "034" || ident === "035"){storeNum = 6603}
        else if(ident === "214" || ident === "215"){storeNum = 6621}
        else if(ident === "364" || ident === "365"){storeNum = 6636}
        else if(ident === "724" || ident === "725"){storeNum = 6672}
        else
        {
          displayJob.setText("Store Number not found. Invalid PO. Please Re-enter.");
          return;
        }
      }

      let inputBilled = textBoxBilled.displayText();
      let decimal = inputBilled.indexOf(".");
      if(decimal === -1) //No Decimal Point
      { 
        billedAmount = inputBilled + "00" //Convert to pennies for storage.
      }
      else 
      {
        if(inputBilled.length === decimal+1) //No Chars after decimal
        {
          billedAmount = inputBilled.slice(0, decimal) + "00"
        }
        else if(inputBilled.length === decimal+2)
        {
          billedAmount = inputBilled.slice(0, decimal) + inputBilled.slice(decimal+1) + "0"
        }
        else //Two or more chars after decimal
        {
          billedAmount = inputBilled.slice(0, decimal) + inputBilled.slice(decimal+1, decimal+3)
        }
      }

      if( !(/^\d+$/.test(billedAmount) && billedAmount != "00" ) )
      {
        displayJob.setText("Invalid amount billed. Please re-enter");
        return;
      }

      date = dateSelector.date().toString(1);

      try{
          await prisma.Job.create({
              data: {
                  PO: poNum,
                  Store: storeNum,
                  billDate: new Date(date),
                  amountBilled: parseInt(billedAmount) //Remember, storing dollar amount as cents
              },
          })
          displayJob.setText("Job Successfully Created:\nPO Number: " + poNum 
          + "\nStore Number: " + storeNum + "\nDate: " + date + "\nAmount Billed: $" + inputBilled);
      }
      catch(err){
          if( err.toString().includes("Unique constraint failed on the constraint: `PRIMARY`") )
          {
            displayJob.setText("A Job matching that PO and Store Number is already in the database");
          }
          else
          {   
            displayJob.setText("Unknown Error:\n\n" + err);
          }
      }
    });

    const displayJob = new QTextBrowser();
    displayJob.setReadOnly(true);

    const ExitButton = new QPushButton();
    ExitButton.setText('Exit');
    ExitButton.addEventListener('clicked', () => {
        dialog.close();
    });


    dialogLayout.addWidget(labelPO1);
    dialogLayout.addWidget(textBoxPO1);

    dialogLayout.addWidget(labelStore1);
    dialogLayout.addWidget(textBoxStore1);

    dialogLayout.addWidget(labelDate);
    dialogLayout.addWidget(dateSelector.calendarWidget());

    dialogLayout.addWidget(labelBilled);
    dialogLayout.addWidget(textBoxBilled);

    dialogLayout.addWidget(submitButton);
    dialogLayout.addWidget(displayJob);
    dialogLayout.addWidget(ExitButton);
    
    
    dialog.setInlineStyle(`
        padding: 10;
        height: 990px;
        background-color: #cc00ff;
        flex-direction: 'column';
        align-items:'center';
        justify-content: 'space-around';
    `);
    //It Doesn't seem to understand how big the text box is, or it caps the default size of the window.
    dialog.resize(dialog.width(), dialog.height() * 1.25) 

    dialog.exec();

});

const buttonEdit = new QPushButton();
buttonEdit.setText('Edit a Job');
buttonEdit.addEventListener('clicked', async () => {

  const dialog = new QDialog();
  const dialogLayout = new FlexLayout()
  dialog.setLayout(dialogLayout);
  dialog.setWindowTitle("Edit a Job");

  const ExitButton = new QPushButton();
  ExitButton.setText('Exit');
  ExitButton.addEventListener('clicked', () => {
    dialog.close();
  });

  dialogLayout.addWidget(ExitButton);
    

  dialog.setInlineStyle(`
      padding: 10;
      height: 1980px;
      flex-direction: 'column';
      align-items:'center';
      justify-content: 'space-around';
  `);

  dialog.exec();
});

rootLayout.addWidget(buttonCreate);
rootLayout.addWidget(buttonEdit);

win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #myroot {
      background-color: #F24F0F;
      height: '100%';
      align-items: 'center';
      justify-content: 'center';
    }
    #title {
      font-size: 18px;
      font-weight: bold;
      padding: 1;
    }
    #label {
      font-size: 12px;
      padding: 1;
    }
  `
);
win.show();

(global).win = win;