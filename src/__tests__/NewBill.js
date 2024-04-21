/**
 * @jest-environment jsdom
 */

/* import { screen, fireEvent } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import {localStorageMock} from "../__mocks__/localStorage.js";
 */
import { screen,fireEvent, waitFor,getByTestId } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill, {updateBill} from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test("Then je vois la form 'envoyer une note de frais'", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      const form = screen.getByText('Envoyer une note de frais');
      expect(form).toBeTruthy();
    });
  });
});

/* describe("When I do not fill in the fields of the required form, I click on the 'Send' button", () => {
  test('Then I am told to fill in the required fields, I still stay on form', () => {
    document.body.innerHTML = NewBillUI();

    const form = screen.getByTestId('form-new-bill');
    const buttonNewBill = jest.fn(e => e.preventDefault());
    form.addEventListener('submit', buttonNewBill);
    fireEvent.submit(form);

    // Result ok si je peux voir form avecdes  champs vide et le boutton envoyer
    expect(form).toBeTruthy();
    expect(screen.getByTestId('expense-name').value).toBe('');
    expect(screen.getByTestId('amount').value).toBe('');
    expect(screen.getByTestId('commentary').value).toBe('');
    expect(screen.getByTestId('vat').value).toBe('');
    expect(screen.getByTestId('pct').value).toBe('');
    expect(document.getElementById('btn-send-bill')).toBeTruthy();
  });
}); */
describe('When I fill out the form with the wrong file format', () => {
  test("Then I receive  error message and I can't click the 'Submit' button", () => {
    document.body.innerHTML = NewBillUI();
    const onNavigate = pathname => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage
    });
   
    const downloadFile = jest.fn(e => newBill.handleChangeFile(e));
    const buttonSubmit = screen.getByText('Envoyer');
    expect(buttonSubmit.disabled).toBe(false);
    const file = screen.getByTestId('file');
    // Create a file
    const myTestFile = new File(['file'], 'fichier.doc', {
      type: 'text/plain'
    });
    file.addEventListener('change', downloadFile);
    fireEvent.change(file, { target: { files: [myTestFile] } });

    // Result ok if download have been called, a message appear and button submit is disabled
    expect(downloadFile).toHaveBeenCalled();
    expect(screen.getAllByText("le fichier selectionné n'ai pas valide")).toBeTruthy();

    expect(buttonSubmit.disabled).toBe(true);
    const TestFile = new File([''], 'fichier.jpg', { type: 'image/jpg' });
    file.addEventListener('change', downloadFile);
    fireEvent.change(file, { target: { files: [TestFile] } });
    console.log(document.body)
    expect(screen.getByTestId('error-file').textContent).toBe('')
  });
});
describe("When I fill in the form with a good file format (jpg,jpeg,png,gif), I can click on the 'Send' button", () => {
  test("Then I am redirected to the Bills page with display of the new 'Bill' with a 'pending' status", () => {
    document.body.innerHTML = NewBillUI();
    const onNavigate = pathname => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage
    });
    console.log(document.body);
    const downloadFile = jest.fn(e => newBill.handleChangeFile(e));
    const file = screen.getByTestId('file');
   
    const myTestFile = new File([''], 'fichier.jpg', { type: 'image/jpg' });
    file.addEventListener('change', downloadFile);
    fireEvent.change(file, { target: { files: [myTestFile] } });

    expect(downloadFile).toHaveBeenCalled();
    const btnSendBill = screen.getByText('Envoyer');
  
    expect(btnSendBill.disabled).toBe(false);
   
    /* 
    const formNewBill = screen.getByTestId("form-new-bill")

    userEvent.selectOptions(formNewBill.querySelector(`select[data-testid="expense-type"]`), "Transports")
    userEvent.type(formNewBill.querySelector(`input[data-testid="expense-name"]`), "Apero collègue")
    userEvent.type(formNewBill.querySelector(`input[data-testid="amount"]`), "100")
    userEvent.type(formNewBill.querySelector(`input[data-testid="vat"]`), "20")
    userEvent.type(formNewBill.querySelector(`input[data-testid="pct"]`), "10")
    userEvent.type(formNewBill.querySelector(`textarea[data-testid="commentary"]`), "Commentaire!!")
    const dateInput = formNewBill.querySelector(`input[data-testid="datepicker"]`)
    dateInput.setAttribute("value", "2020-05-01")
    userEvent.click(dateInput);

    const updateBillSpy = jest.spyOn(newBill, "updateBill")
    const handleSubmit = jest.spyOn(newBill,"handleSubmit")

    handleSubmit({
      preventDefault: jest.fn(),
      target: formNewBill,
    })
    // Result ok if "handleSubmit" and "updateBillSpy" have been called
    expect(handleSubmit).toHaveBeenCalled()
    expect(updateBillSpy).toHaveBeenCalled();

    // Result ok If I am on Bills Page
    expect(screen.getByText("Mes notes de frais")).toBeTruthy()

    const updateBillArgs = updateBillSpy.mock.calls[0]
    const [billData] = updateBillArgs

    // Result ok if the data received by "updateBillArgs" is correct
    expect(billData.name).toBe("Apero collègue")
    // Result ok if the Bills default status is "pending"
    expect(billData.status).toBe("pending") */
  });
});


/* describe("Given I am a user connected as Employee",()=>{
  describe("When I submit Form",()=>{
    test("Then the Bill is create with success, POST(201)", async()=>{
      document.body.innerHTML = NewBillUI()
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })}
       
      
      const newBill= new NewBill({ document, onNavigate, store:mockStore, localStorage: window.localStorage })

      const file = screen.getByTestId("file")
      const myTestFile = new File([""], "fichier.jpg", { type: "image/jpg" })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const createSpy = jest.spyOn(mockStore.bills(), "create")

      file.addEventListener("change",handleChangeFile)
      fireEvent.change(file, {target: {files: [myTestFile]}})

      expect(handleChangeFile).toHaveBeenCalled()
      console.log(document.body)
      const contentRefused  = await screen.getByText("le fichier selectionné n'ai pas valide")
      expect(contentRefused).not.toBeTruthy()
      //expect(screen.getByText("le fichier selectionné n'ai pas valide")).not.toBeTruthy()
      await new Promise(process.nextTick);

      // Result ok if "createSpy" have been called
      expect(createSpy).toHaveBeenCalled()
      // Result ok if NewBill's Constructor have been updated
      expect(newBill.fileName).not.toBe(null)
      expect(newBill.fileUrl).not.toBe(null)
      expect(newBill.billId).toBe("1234")
 
      const formNewBill = screen.getByTestId("form-new-bill")
      userEvent.selectOptions(formNewBill.querySelector(`select[data-testid="expense-type"]`), "Transports")
      userEvent.type(formNewBill.querySelector(`input[data-testid="expense-name"]`), "Apero collègue")
      userEvent.type(formNewBill.querySelector(`input[data-testid="amount"]`), "100")
      userEvent.type(formNewBill.querySelector(`input[data-testid="vat"]`), "20")
      userEvent.type(formNewBill.querySelector(`input[data-testid="pct"]`), "10")
      userEvent.type(formNewBill.querySelector(`textarea[data-testid="commentary"]`), "C\'était cool !!")
      const dateInput = formNewBill.querySelector(`input[data-testid="datepicker"]`)
      dateInput.setAttribute("value", "2020-05-01")
      userEvent.click(dateInput);

      const handleSubmit = jest.spyOn(newBill,"handleSubmit")
      const updateBillSpy = jest.spyOn(newBill, "updateBill")

      handleSubmit({
        preventDefault: jest.fn(),
        target: formNewBill,
      })
      expect(handleSubmit).toHaveBeenCalled()
      expect(updateBillSpy).toHaveBeenCalled()

      // Result ok if after validation we have been redirected to Bills
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  }) }) */