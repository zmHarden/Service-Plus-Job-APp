import { QMainWindow, QWidget, QLabel, FlexLayout, QGridLayout, QPushButton, QLineEdit, 
  QDateEdit, QTextBrowser, QCalendarWidget, QDate, QDialog } from '@nodegui/nodegui';
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
  const dialogLayout = new FlexLayout();
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

  const labelInstaller1 = new QLabel();
  labelInstaller1.setObjectName("label");
  labelInstaller1.setText("Installer: ");

  const textBoxInstaller1 = new QLineEdit();

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

  const labelPaid = new QLabel();
  labelPaid.setObjectName("label");
  labelPaid.setText("Amount Paid: ");

  const textBoxPaid = new QLineEdit();

  const submitButton = new QPushButton();
  submitButton.setText('Submit');
  submitButton.addEventListener('clicked', async () => {

    let inputPO = textBoxPO1.displayText();
    let poNum = null;
    let storeNum = null;
    let billedAmount = null;
    let paidAmount = null;
    let date = null;
    let installerName = null;
    
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
    if(inputBilled != "")
    {
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

      if( !(/^\d+$/.test(billedAmount)) )
      {
        displayJob.setText("Invalid amount billed. Please re-enter");
        return;
      }

      //Robert, Mark, Steven, John, Aaron, Richard
    }

    let inputPaid = textBoxPaid.displayText();
    decimal = inputPaid.indexOf(".");
    if(inputPaid != "")
    {
      if(decimal === -1)
      { 
        paidAmount = inputPaid + "00"
      }
      else 
      {
        if(inputPaid.length === decimal+1)
        {
          paidAmount = inputPaid.slice(0, decimal) + "00"
        }
        else if(inputPaid.length === decimal+2)
        {
          paidAmount = inputPaid.slice(0, decimal) + inputPaid.slice(decimal+1) + "0"
        }
        else
        {
          paidAmount = inputPaid.slice(0, decimal) + inputPaid.slice(decimal+1, decimal+3)
        }
      }

      if( !(/^\d+$/.test(paidAmount)) )
      {
        displayJob.setText("Invalid amount Paid. Please re-enter");
        return;
      }
    }
    
    if(billedAmount === null && paidAmount === null)
    {
      displayJob.setText("Must enter either amount billed or amount paid");
      return;
    }

    date = dateSelector.date().toString(1);

    installerName = textBoxInstaller1.displayText();

    try{

      await prisma.Job.create({
        data: {
            PO: poNum,
            Store: storeNum,
            billDate: new Date(date),
            amountBilled: parseInt(billedAmount), //Remember, storing dollar amount as cents
            amountPaid: parseInt(paidAmount),
            installer: installerName
        },
      })

      displayJob.setText("Job Successfully Created:\nPO Number: " + poNum 
      + "\nStore Number: " + storeNum + "\nInstaller: " + installerName + "\nDate: " + date 
      + "\nAmount Billed: $" + inputBilled + "\nAmount Paid: $" + inputPaid);

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

  dialogLayout.addWidget(labelInstaller1);
  dialogLayout.addWidget(textBoxInstaller1);

  dialogLayout.addWidget(labelDate);
  dialogLayout.addWidget(dateSelector.calendarWidget());

  //Trying to implement two text inputs side-by-side
  /*const boxWidget = new QWidget();
  const boxLayout = new QBoxLayout(0, dialog);
  boxWidget.setLayout(boxLayout);

  boxLayout.addWidget(labelBilled);
  boxLayout.addWidget(textBoxBilled);
  boxLayout.addWidget(labelPaid);
  boxLayout.addWidget(textBoxPaid);
  dialogLayout.addWidget(boxWidget);*/

  dialogLayout.addWidget(labelBilled);
  dialogLayout.addWidget(textBoxBilled);

  dialogLayout.addWidget(labelPaid);
  dialogLayout.addWidget(textBoxPaid);

  dialogLayout.addWidget(submitButton);
  dialogLayout.addWidget(displayJob);
  dialogLayout.addWidget(ExitButton);
  
  
  dialog.setInlineStyle(`
    padding: 10;
    
    flex-direction: 'column';
    align-items:'center';
    justify-content: 'space-around';
  `); //background-color: #cc00ff; //height: 990px;
  //It Doesn't seem to understand how big the text box is, or it caps the default size of the window.
  dialog.resize(dialog.width(), dialog.height() * 1.4) 

  dialog.exec();

});

//-----------------------------------------------------------------------------------------------------

const buttonEdit = new QPushButton();
buttonEdit.setText('Edit a Job');
buttonEdit.addEventListener('clicked', async () => {
  
  let foundJob = null;

  const dialog = new QDialog();
  const dialogLayout = new FlexLayout()
  dialog.setLayout(dialogLayout);
  dialog.setWindowTitle("Edit a Job");

  const labelPO1 = new QLabel();
  labelPO1.setObjectName("label");
  labelPO1.setText("PO #: ");

  const textBoxPO1 = new QLineEdit();

  const labelStore1 = new QLabel();
  labelStore1.setObjectName("label");
  labelStore1.setText("Store # (If PO starts with 35): ");

  const textBoxStore1 = new QLineEdit();

  const SearchButton = new QPushButton();
  SearchButton.setText('Search for Job');
  SearchButton.addEventListener('clicked', async () => {

    let inputPO = textBoxPO1.displayText();
    let poNum = null;
    let storeNum = null;
    
    if( /^\d*$/.test(inputPO) ) //Regex Checking if input contains only numbers
    {
      if(inputPO.length != 8)
      {
        textBoxFound.setText("Invalid PO #");
        return;
      }
      poNum = parseInt(inputPO);
    }
    else
    {
      textBoxFound.setText("Invalid PO #");
      return;
    }


    if(inputPO.substring(0, 2) === "35")
    {
      let inputStore = textBoxStore1.displayText()
      if(inputStore === "")
      {
        textBoxFound.setText("Please enter store #.");
        return;
      }

      if( /^\d*$/.test(inputStore) && ( inputStore === "6635" || inputStore === "0635" || inputStore === "635") )
      {
        storeNum = parseInt(inputStore);
      }
      else
      {
        textBoxFound.setText("Invalid store #");
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
        textBoxFound.setText("Store # not found");
        return;
      }
    }

    foundJob = await prisma.Job.findUnique({
      where: {
        Store_PO: {
            PO: poNum,
            Store: storeNum
        }
      }
    })

    if(foundJob === null)
    {
      textBoxFound.setText("Job not found")
      dateSelector.setDate(QDate.currentDate())
      textBoxBilled.setText("")
      textBoxPaid.setText("")
      textBoxInstaller2.setText("")
    }
    else
    {
      let tempBilled = "";
      let tempPaid = "";
      if(foundJob.amountBilled != null)
      {
        tempBilled = foundJob.amountBilled.toString()
        if(tempBilled !== "0")
        {
          tempBilled = tempBilled.slice(0, tempBilled.length-2) + "." + tempBilled.slice(tempBilled.length-2)
        }
      }
      if(foundJob.amountPaid != null)
      {
        tempPaid = foundJob.amountPaid.toString()
        if(tempPaid !== "0")
        {
          tempPaid = tempPaid.slice(0, tempPaid.length-2) + "." + tempPaid.slice(tempPaid.length-2)
        }
      }

      let foundDate = new Date(foundJob.billDate)
      let foundQDate = new QDate( foundDate.getUTCFullYear(), foundDate.getUTCMonth(), foundDate.getUTCDate() )      
      let installerName = foundJob.installer;

      textBoxFound.setText("Found: " + poNum + ", " + storeNum);
      dateSelector.setDate(foundQDate )
      textBoxBilled.setText(tempBilled)
      textBoxPaid.setText(tempPaid)
      textBoxInstaller2.setText(installerName)
    }

  });

  const textBoxFound = new QLineEdit();
  textBoxFound.setReadOnly(true);

  const labelInstaller2 = new QLabel();
  labelInstaller2.setObjectName("label");
  labelInstaller2.setText("Installer: ");

  const textBoxInstaller2 = new QLineEdit();

  const labelDate = new QLabel();
  labelDate.setObjectName("label");
  labelDate.setText("Date: ");

  const dateSelector = new QDateEdit();
  dateSelector.setDate(QDate.currentDate());

  const labelBilled = new QLabel();
  labelBilled.setObjectName("label");
  labelBilled.setText("Amount Billed: ");

  const textBoxBilled = new QLineEdit();

  const labelPaid = new QLabel();
  labelPaid.setObjectName("label");
  labelPaid.setText("Amount Paid: ");

  const textBoxPaid = new QLineEdit();

  const EditButton = new QPushButton();
  EditButton.setText('Update');
  EditButton.addEventListener('clicked', async () => {
    if(foundJob === null)
    {
      textBoxUpdate.setText("No job currently selected")
    }
    else
    {
      let billedAmount = null;
      let paidAmount = null;

      let inputBilled = textBoxBilled.displayText();
      let decimal = inputBilled.indexOf(".");
      if(inputBilled != "")
      {
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

        if( !(/^\d+$/.test(billedAmount)) )
        {
          textBoxUpdate.setText("Invalid amount billed.");
          return;
        }
      }

      let inputPaid = textBoxPaid.displayText();
      decimal = inputPaid.indexOf(".");
      if(inputPaid != "")
      {
        if(decimal === -1) //No Decimal Point
        { 
          paidAmount = inputPaid + "00" //Convert to pennies for storage.
        }
        else 
        {
          if(inputPaid.length === decimal+1) //No Chars after decimal
          {
            paidAmount = inputPaid.slice(0, decimal) + "00"
          }
          else if(inputPaid.length === decimal+2)
          {
            paidAmount = inputPaid.slice(0, decimal) + inputPaid.slice(decimal+1) + "0"
          }
          else //Two or more chars after decimal
          {
            paidAmount = inputPaid.slice(0, decimal) + inputPaid.slice(decimal+1, decimal+3)
          }
        }

        if( !(/^\d+$/.test(paidAmount)) )
        {
          textBoxUpdate.setText("Invalid amount Paid.");
          return;
        }
      }

      let date = new Date(dateSelector.date().toString(1));

      try
      {
        let edited = await prisma.Job.update({
          where: {
            Store_PO: {
                PO: foundJob.PO,
                Store: foundJob.Store
            }
          },
          data: {
            billDate: date,
            amountBilled: parseInt(billedAmount),
            amountPaid: parseInt(paidAmount)
          }
        })

        textBoxUpdate.setText("Job successfully edited");
      }
      catch(err)
      {
        textBoxUpdate.setText("Error. Check log");
        console.log(err);
      }
    }
  });

  const textBoxUpdate = new QLineEdit();
  textBoxUpdate.setReadOnly(true);

  const ExitButton = new QPushButton();
  ExitButton.setText('Exit');
  ExitButton.addEventListener('clicked', () => {
    dialog.close();
  });

  dialogLayout.addWidget(labelPO1);
  dialogLayout.addWidget(textBoxPO1);

  dialogLayout.addWidget(labelStore1);
  dialogLayout.addWidget(textBoxStore1);

  dialogLayout.addWidget(SearchButton);

  dialogLayout.addWidget(textBoxFound);

  dialogLayout.addWidget(labelInstaller2);
  dialogLayout.addWidget(textBoxInstaller2);

  dialogLayout.addWidget(labelDate);
  dialogLayout.addWidget(dateSelector);

  dialogLayout.addWidget(labelBilled);
  dialogLayout.addWidget(textBoxBilled);

  dialogLayout.addWidget(labelPaid);
  dialogLayout.addWidget(textBoxPaid);

  dialogLayout.addWidget(EditButton);
  dialogLayout.addWidget(textBoxUpdate);

  dialogLayout.addWidget(ExitButton);
    

  dialog.setInlineStyle(`
      padding: 10;
      flex-direction: 'column';
      align-items:'center';
      justify-content: 'space-around';
  `);
  dialog.resize(dialog.width(), dialog.height() /** 1.25*/) 

  dialog.exec();
});

const buttonView = new QPushButton();
buttonView.setText('View Jobs');
buttonView.addEventListener('clicked', async () => {

  const dialog = new QDialog();
  const dialogLayout = new QGridLayout()
  dialog.setLayout(dialogLayout);
  dialog.setWindowTitle("View Mismatched Jobs");

  const displayJobs = new QTextBrowser();
  displayJobs.setReadOnly(true);

  let allJobs = null;

  allJobs = await prisma.Job.findMany({
    where: {
      amountBilled: {
        not: null
      },
      amountPaid: {
        not: null
      },
      OR: [
        {
          amountBilled: {
            gt: prisma.Job.fields.amountPaid
          }
        },
        {
          amountPaid: {
            gt: prisma.Job.fields.amountBilled
          }
        }
      ]
    }
  })

  let jobsList = "";
  for(let x = 0; x < allJobs.length; x++)
  {
    if( Math.abs(allJobs[x].amountBilled - allJobs[x].amountPaid) >= 1000 )
    {
      let tempBilled = (allJobs[x].amountBilled).toString();
      let billedString = tempBilled.slice(0, tempBilled.length-2) + "." + tempBilled.slice(tempBilled.length-2)

      let tempPaid = (allJobs[x].amountPaid).toString();
      let paidString = tempPaid.slice(0, tempPaid.length-2) + "." + tempPaid.slice(tempPaid.length-2)
      
      let dateString = allJobs[x].billDate.toUTCString().slice(0, 16)

      jobsList = jobsList + "PO: " + allJobs[x].PO + "\nStore: " + allJobs[x].Store
        + "\nInstaller: " + allJobs[x].installer 
        + "\nAmount Billed: " + billedString + "\nAmount Paid: " + paidString
        + "\nDate: " + dateString + "\n\n"
    }
  }

  if(jobsList === "")
  {
    displayJobs.setText("No Jobs currently found that are mismatched")
  }
  else
  {
    displayJobs.setText(jobsList);
  }
  

  const ExitButton = new QPushButton();
  ExitButton.setText('Exit');
  ExitButton.addEventListener('clicked', () => {
    dialog.close();
  });

  dialogLayout.addWidget(displayJobs, 0, 0);
  dialogLayout.addWidget(ExitButton, 1, 0);
    
  dialog.setInlineStyle(`
    padding: 10;  
    justify-content: 'space-around';
  `);
  /*
      height: 900px;
      flex-direction: 'column';
      align-items:'center'; //This makes space left and right of the content
      justify-content: 'space-around'; //This makes space above and below the content
   */
  //dialog.resize(dialog.width(), dialog.height())
  //displayJobs.resize(displayJobs.width(), displayJobs.height())

  dialog.exec();
});

rootLayout.addWidget(buttonCreate);
rootLayout.addWidget(buttonEdit);
rootLayout.addWidget(buttonView);

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