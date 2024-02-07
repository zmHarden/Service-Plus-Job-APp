import { QMainWindow, QWidget, QLabel, FlexLayout, QGridLayout, QPushButton, QLineEdit, 
  QDateEdit, QTextBrowser, QCalendarWidget, QDate, QDialog, QComboBox } from '@nodegui/nodegui';
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

  let allInstallers = await prisma.Installers.findMany();
  let allStores = await prisma.Stores.findMany();
  let storeIdMap = new Map();
  for(let x = 0; x < allStores.length; x++)
  {
    //Last two digits of Store Number match first two of PO number, used later to match PO to Store
    let ident = ((allStores[x].store).toString()).slice(-2);

    //HDC doesn't use the same ident system
    //635 & 6635 overlap, and BDC & 1017 overlap. Both need additional user input
    if(isNaN(parseInt(ident)) || ident === "35") 
    {
      //Special cases match store to store Id
      storeIdMap.set(allStores[x].store, allStores[x].id)
    }
    else
    { 
      //Match PO idents (first two digits) to store Ids
      storeIdMap.set(ident, allStores[x].id);
    }
  }

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
  labelStore1.setText("Store # (If required): ");

  const textBoxStore1 = new QLineEdit();

  const labelInstaller1 = new QLabel();
  labelInstaller1.setObjectName("label");
  labelInstaller1.setText("Installer: ");

  const comboboxInstaller1 = new QComboBox();
  for(let x = 0; x < allInstallers.length; x++)
  {
    comboboxInstaller1.addItem(undefined, allInstallers[x].installer);
  }
  comboboxInstaller1.addItem(undefined, "N/A")
  comboboxInstaller1.setCurrentIndex(allInstallers.length);

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

    displayJob.setText("");
    let inputPO = textBoxPO1.displayText();
    let storeId = null; 
    let isHDC = false; let isMeasure = false;
    let billedAmount = null;
    let paidAmount = null;
    let date = null;
    
    //HDC jobs are 10 characters, starting with two letters
    if(inputPO.length === 10 && isNaN(parseInt(inputPO[0])) && isNaN(parseInt(inputPO[1])) )
    {
      if(/^\d*$/.test(inputPO.substring(2, inputPO.length))) //2 letters, 8 numbers
      {
        storeId = storeIdMap.get("HDC");
        isHDC = true;
      }
      else
      {
        displayJob.setText("HDC POs must contain two letters followed by eight numbers. Please re-enter");
        return;
      }
    }
    //BDC has measures that use the same PO as the install, so we have a seperate way to store them
    else if(inputPO.length === 9 && inputPO[0].toLowerCase() === "m")
    {
      if(/^\d*$/.test(inputPO.substring(1, inputPO.length))) //m, 8 numbers
      {
        storeId = storeIdMap.get("BDC")
        isMeasure = true;
      }
      else
      {
        displayJob.setText("BDC measure POs must contain m or M followed by eight numbers. Please re-enter");
        return;
      } 
    }
    else if( /^\d*$/.test(inputPO) ) //Regex Checking if input contains only numbers
    {
      if(inputPO.length != 8)
      {
        displayJob.setText("Incorrect length. Please enter valid PO number.");
        return;
      }
    }
    else
    {
      displayJob.setText("Normal POs must contain only numbers. Please re-enter");
      return;
    }

    //If the PO isn't an HDC PO or a BDC measure, try to map it to a store.
    if(!isHDC && !isMeasure) 
    {
      if(inputPO.substring(0, 2) === "35")
      {
        let inputStore = textBoxStore1.displayText()
        if(inputStore === "")
        {
          displayJob.setText("Please enter store number. (635 or 6635)");
          return;
        }

        if( /^\d*$/.test(inputStore) && ( inputStore === "6635" || inputStore === "635") )
        {
          storeId = storeIdMap.get(inputStore);
        }
        else
        {
          displayJob.setText("Please enter valid store number");
          return;
        }
      }
      else if(inputPO.substring(0, 2) === "17")
      {
        let inputStore = textBoxStore1.displayText()
        if(inputStore === "")
        {
          displayJob.setText("Please enter store number. (1017 or BDC)");
          return;
        }
   
        let upper = inputStore.toUpperCase();
        if( inputStore === "1017" )
        {
          storeId = storeIdMap.get("1017");
        }
        else if( upper === "BDC")
        {
          storeId = storeIdMap.get(upper);
        }
        else
        {
          displayJob.setText("Please enter valid store number");
          return;
        }
      }
      else if(inputPO.substring(0, 1) === "1") //All valid POs starting with 1 are BDC jobs, besides 1017's.
      {
        storeId = storeIdMap.get("BDC");
      }
      else
      {
        let ident = inputPO.substring(0, 2); //First two numbers of PO tell us the store number
        if (storeIdMap.has(ident)) 
        {
          storeId = storeIdMap.get(ident);
        } 
        else 
        {
          displayJob.setText("Store Number not found. Invalid PO. Please Re-enter.");
          return;
        }
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

    let installerId = comboboxInstaller1.currentIndex();
    //Shift the index to start from 1 like MySQL
    let databaseInstaller = installerId + 1;

    if(installerId === allInstallers.length)
    {
      if(billedAmount !== null)
      {
        displayJob.setText("Must enter an Installer for billed jobs");
        return;
      }
      else
      {
        //If we have n/a selected as the installer, but we aren't billing, we can 
        //store the installer as null.
        databaseInstaller = null;
        installerId = "N/A"
      }
    }
    else
    {
      installerId = allInstallers[installerId].installer
    }

    try{

      await prisma.Job.create({
        data: {
            PO: inputPO,
            storeId: storeId,
            billDate: new Date(date),
            amountBilled: parseInt(billedAmount), //Remember, storing dollar amount as cents
            amountPaid: parseInt(paidAmount),
            installerId: databaseInstaller
        },
      })

      displayJob.setText("Job Successfully Created:\nPO Number: " + inputPO 
      + "\nStore Number: " + allStores[storeId-1].store + "\nInstaller: " + installerId  
      + "\nDate: " + date + "\nAmount Billed: $" + inputBilled + "\nAmount Paid: $" + inputPaid);
      textBoxPO1.setText("");
      textBoxStore1.setText("");
      comboboxInstaller1.setCurrentIndex(allInstallers.length);
      dateSelector.setDate(QDate.currentDate());
      textBoxBilled.setText("");
      textBoxPaid.setText("");

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
  dialogLayout.addWidget(comboboxInstaller1);

  dialogLayout.addWidget(labelDate);
  dialogLayout.addWidget(dateSelector.calendarWidget());

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
  dialog.setMinimumSize(400, 500)
  //It Doesn't seem to understand how big the text box is, or it caps the default size of the window.
  dialog.resize(dialog.width(), dialog.height() * 1.4) 
  dialog.setModal(true);
  dialog.show();

});

//-----------------------------------------------------------------------------------------------------

const buttonEdit = new QPushButton();
buttonEdit.setText('Edit a Job');
buttonEdit.addEventListener('clicked', async () => {
  
  let foundJob = null;
  let allInstallers = await prisma.Installers.findMany();
  let allStores = await prisma.Stores.findMany();
  let storeIdMap = new Map();
  for(let x = 0; x < allStores.length; x++)
  {
    //Last two digits of Store Number match first two of PO number, used later to match PO to Store
    let ident = ((allStores[x].store).toString()).slice(-2);

    //HDC doesn't use the same ident system
    //635 & 6635 overlap, and BDC & 1017 overlap. Both need additional user input
    if(isNaN(parseInt(ident)) || ident === "35") 
    {
      //Special cases match store to store Id
      storeIdMap.set(allStores[x].store, allStores[x].id)
    }
    else
    { 
      //Match PO idents (first two digits) to store Ids
      storeIdMap.set(ident, allStores[x].id);
    }
  }

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
  labelStore1.setText("Store # (If required): ");

  const textBoxStore1 = new QLineEdit();

  const SearchButton = new QPushButton();
  SearchButton.setText('Search for Job');
  SearchButton.addEventListener('clicked', async () => {

    let inputPO = textBoxPO1.displayText();
    let poNum = null;
    let storeId = null; let isHDC = false; let chopped = null;
    textBoxBilled.setText("");
    textBoxPaid.setText("");
    dateSelector.setDate(QDate.currentDate());
    comboboxInstaller2.setCurrentIndex(allInstallers.length);
    foundJob = null;
    
    if(inputPO.length === 10 && (inputPO[0] === "w" || inputPO[0] === "W") )
    {
      chopped = inputPO.substring(0, 2); //Save the two characters for displaying
      inputPO = inputPO.substring(2, inputPO.length); //Chop the first two chars off the HDC PO
      storeId = storeIdMap.get("HDC");
      isHDC = true;
    }

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


    if(!isHDC)
    {
      let inputStore = textBoxStore1.displayText()
      if(inputPO.substring(0, 2) === "35")
      {
        if(inputStore === "")
        {
          textBoxFound.setText("Enter store: (6635 or 635)");
          return;
        }

        if( /^\d*$/.test(inputStore) && ( inputStore === "6635" || inputStore === "635") )
        {
          storeId = storeIdMap.get(inputStore);
        }
        else
        {
          textBoxFound.setText("Invalid store #");
          return;
        }
      }
      else if(inputPO.substring(0, 2) === "17")
      {
        if(inputStore === "")
        {
          textBoxFound.setText("Enter store: (1017 or BDC)");
          return;
        }
   
        let upper = inputStore.toUpperCase();
        if( inputStore === "1017" )
        {
          storeId = storeIdMap.get("17");
        }
        else if( upper === "BDC")
        {
          storeId = storeIdMap.get(upper);
        }
        else
        {
          textBoxFound.setText("Please enter valid store number");
          return;
        }
      }
      else if(inputPO.substring(0, 1) === "1")
      {
        storeId = storeIdMap.get("BDC");
      }
      else
      {
        let ident = inputPO.substring(0, 2); //First three numbers tell us the store number
        if (storeIdMap.has(ident)) 
        {
          storeId = storeIdMap.get(ident);
        } 
        else 
        {
          textBoxFound.setText("Store not found. Please re-enter");
          return;
        }
      }
    }
    

    foundJob = await prisma.Job.findUnique({
      where: {
        storeId_PO: {
            PO: poNum,
            storeId: storeId
        }
      }
    })

    textBoxUpdate.setText("");

    if(foundJob === null)
    {
      textBoxFound.setText("Job not found")
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
      let installerId = foundJob.installerId - 1; //Convert from Id to Index (Start from 1 to 0)

      textBoxFound.setText("Found: " + poNum + ", " + allStores[storeId-1].store);
      dateSelector.setDate(foundQDate )
      textBoxBilled.setText(tempBilled)
      textBoxPaid.setText(tempPaid)
      comboboxInstaller2.setCurrentIndex(installerId)
    }

  });

  const textBoxFound = new QLineEdit();
  textBoxFound.setReadOnly(true);

  const labelInstaller2 = new QLabel();
  labelInstaller2.setObjectName("label");
  labelInstaller2.setText("Installer: ");

  const comboboxInstaller2 = new QComboBox();
  for(let x = 0; x < allInstallers.length; x++)
  {
    comboboxInstaller2.addItem(undefined, allInstallers[x].installer);
  }
  comboboxInstaller2.addItem(undefined, "N/A")
  comboboxInstaller2.setCurrentIndex(allInstallers.length);

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
      let inputPaid = textBoxPaid.displayText();
      let installerId = comboboxInstaller2.currentIndex();
      let mySQLId = installerId + 1 //Convert to start-from-1 index

      if(inputBilled === "" && inputPaid ==="")
      {
        textBoxUpdate.setText("Job must be billed or paid");
        return;
      }

      let decimal = inputBilled.indexOf(".");
      if(inputBilled != "") //If there is a billed amount
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

        if(installerId === allInstallers.length)
        {
          textBoxUpdate.setText("No Installer selected");
          return;
        }
      }
      else
      {
        if(installerId === allInstallers.length)
        {
          mySQLId = null;
        }
      }

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
            storeId_PO: {
                PO: foundJob.PO,
                storeId: foundJob.storeId
            }
          },
          data: {
            billDate: date,
            amountBilled: parseInt(billedAmount),
            amountPaid: parseInt(paidAmount),
            installerId: mySQLId
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
  dialogLayout.addWidget(comboboxInstaller2);

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
  dialog.setMinimumSize(400, 500)
  dialog.resize(dialog.width(), dialog.height() /** 1.25*/) 

  dialog.setModal(true);
  dialog.show();
});

//------------------------------------------------------------------------------------------

const buttonView = new QPushButton();
buttonView.setText('View Jobs');
buttonView.addEventListener('clicked', async () => {

  const dialog = new QDialog();
  const dialogLayout = new QGridLayout()
  dialog.setLayout(dialogLayout);
  dialog.setWindowTitle("View Jobs");

  let installers = await prisma.installers.findMany();
  let stores = await prisma.stores.findMany();

  const comboboxInstaller3 = new QComboBox();
  for(let x = 0; x < installers.length; x++)
  {
    comboboxInstaller3.addItem(undefined, installers[x].installer);
  }
  comboboxInstaller3.addItem(undefined, "N/A")
  comboboxInstaller3.setCurrentIndex(installers.length);

  const comboboxStore3 = new QComboBox();
  for(let x = 0; x < stores.length; x++)
  {
    comboboxStore3.addItem(undefined, stores[x].store);
  }
  comboboxStore3.addItem(undefined, "No Store selected")
  comboboxStore3.setCurrentIndex(stores.length);

  const noPayButton = new QPushButton();
  noPayButton.setText('Unpaid Jobs');
  noPayButton.addEventListener('clicked', async () => {

    let unpaidJobs = null;

    unpaidJobs = await prisma.Job.findMany({
      where: {
        amountPaid:null 
      }
    })

    let jobsList = "";
    for(let x = 0; x < unpaidJobs.length; x++)
    {
      //If an installer is selected, but doesn't match the current job, skip it.
      if(comboboxInstaller3.currentIndex() !== installers.length && 
      comboboxInstaller3.currentIndex()+1 !== unpaidJobs[x].installerId)
      {
        continue;
      }
      //If a store is selected, but doesn't match the current job, skip it.
      if(comboboxStore3.currentIndex() !== stores.length &&
      comboboxStore3.currentIndex()+1 !== unpaidJobs[x].storeId )
      {
        continue;
      }

      let tempBilled = (unpaidJobs[x].amountBilled).toString();
      let billedString = tempBilled.slice(0, tempBilled.length-2) + "." + tempBilled.slice(tempBilled.length-2)
      
      let dateString = unpaidJobs[x].billDate.toUTCString().slice(0, 16)

      jobsList = jobsList + "PO: " + unpaidJobs[x].PO 
        + "\nStore: " + stores[unpaidJobs[x].storeId-1].store
        + "\nInstaller: " + installers[unpaidJobs[x].installerId - 1].installer
        + "\nAmount Billed: " + billedString + "\nDate: " + dateString + "\n\n"
    }

    if(jobsList === "")
    {
      displayJobs.setText("No unpaid jobs found")
    }
    else
    {
      displayJobs.setText(jobsList);
    }

  });

  const mismatchedButton = new QPushButton();
  mismatchedButton.setText('Mismatched Jobs');
  mismatchedButton.addEventListener('clicked', async () => {

    let mismatchedJobs = null;

    mismatchedJobs = await prisma.Job.findMany({
      where: {
        AND: [
          {
            amountBilled: {
              not: null,
            }
          },
          {
            amountPaid: {
              not: null
            }
          }
        ],
        NOT: {
          amountBilled: {
            equals: prisma.job.fields.amountPaid
          }
        }
      }
    })

    let jobsList = "";

    for(let x = 0; x < mismatchedJobs.length; x++)
    {
      if(comboboxInstaller3.currentIndex() !== installers.length && 
      comboboxInstaller3.currentIndex()+1 !== mismatchedJobs[x].installerId)
      {
        continue;
      }
      if(comboboxStore3.currentIndex() !== stores.length &&
      comboboxStore3.currentIndex()+1 !== mismatchedJobs[x].storeId)
      {
        continue;
      }

      //Check if the job's pay and bill differ by $10 or more.
      if( Math.abs(mismatchedJobs[x].amountBilled - mismatchedJobs[x].amountPaid) >= 1000 )
      {
        let tempBilled = (mismatchedJobs[x].amountBilled).toString();
        let billedString = tempBilled.slice(0, tempBilled.length-2) + "." + tempBilled.slice(tempBilled.length-2)

        let tempPaid = (mismatchedJobs[x].amountPaid).toString();
        let paidString = tempPaid.slice(0, tempPaid.length-2) + "." + tempPaid.slice(tempPaid.length-2)
        
        let dateString = mismatchedJobs[x].billDate.toUTCString().slice(0, 16)

        jobsList = jobsList + "PO: " + mismatchedJobs[x].PO 
          + "\nStore: " + stores[mismatchedJobs[x].storeId-1].store
          + "\nInstaller: " + installers[mismatchedJobs[x].installerId - 1].installer
          + "\nAmount Billed: " + billedString + "\nAmount Paid: " + paidString
          + "\nDate: " + dateString + "\n\n"
      }
    }

    if(jobsList === "")
    {
      displayJobs.setText("No mismatched jobs found")
    }
    else
    {
      displayJobs.setText(jobsList);
    }
    
  });

  const noBillButton = new QPushButton();
  noBillButton.setText('Unbilled Jobs');
  noBillButton.addEventListener('clicked', async () => {
    let unbilledJobs = await prisma.Job.findMany({
      where: 
      {
        amountBilled: null
      }
    })

    let jobsList = "";
    for(let x = 0; x < unbilledJobs.length; x++)
    {
      if(comboboxStore3.currentIndex() !== stores.length &&
      comboboxStore3.currentIndex()+1 !== unbilledJobs[x].storeId)
      {
        continue;
      }

      let tempPaid = (unbilledJobs[x].amountPaid).toString();
      let paidString = tempPaid.slice(0, tempPaid.length-2) + "." + tempPaid.slice(tempPaid.length-2)

      let dateString = unbilledJobs[x].billDate.toUTCString().slice(0, 16)

      jobsList = jobsList + "PO: " + unbilledJobs[x].PO 
        + "\nStore: " + stores[unbilledJobs[x].storeId-1].store
        + "\nAmount Paid: " + paidString + "\nDate: " + dateString + "\n\n"
    }

    if(jobsList === "")
    {
      displayJobs.setText("No unbilled jobs found")
    }
    else
    {
      displayJobs.setText(jobsList);
    }

  });

  const displayJobs = new QTextBrowser();
  displayJobs.setReadOnly(true);
  

  const ExitButton = new QPushButton();
  ExitButton.setText('Exit');
  ExitButton.addEventListener('clicked', () => {
    dialog.close();
  });

  dialogLayout.addWidget(comboboxInstaller3, 0, 0, 1, 1);
  dialogLayout.addWidget(comboboxStore3, 0, 2, 1, 1); 
  dialogLayout.addWidget(noPayButton, 1, 0);
  dialogLayout.addWidget(mismatchedButton, 1, 1);
  dialogLayout.addWidget(noBillButton, 1, 2);
  dialogLayout.addWidget(displayJobs, 2, 0, 1, 3); //Row 2, Column 0, Stretch over 1 row, 3 columns
  dialogLayout.addWidget(ExitButton, 3, 0, 1, 3); 

  dialogLayout.setColumnStretch(0, 1);
  dialogLayout.setColumnStretch(1, 1); 
  dialogLayout.setColumnStretch(2, 1);
    
  dialog.setInlineStyle(`
    padding: 10;  
  `);

  dialog.setModal(true);
  dialog.show();
});

//-----------------------------------------------------------------------------------------------

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

//Tread Blinds.com (BDC) and HomeDepot.com (HDC) as stores
//BDC jobs start with 1, and are 8 digits. For jobs starting with 17, ask for store number (1017 or BDC [case insensitive])
//HDC jobs start with W and are 10 digits. Chop off first two chars for storage, but handle user input with full 10 chars.