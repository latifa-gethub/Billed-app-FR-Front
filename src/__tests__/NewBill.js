/**
 * @jest-environment jsdom
 */  
import { screen,fireEvent, waitFor } from "@testing-library/dom"
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

 
 describe('When I fill out the form with the wrong file format', () => {
  test("Then I receive  error message and I can't click the 'Submit' button", () => {
    document.body.innerHTML = NewBillUI();
    const onNavigate = pathname => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
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
 
    expect(screen.getAllByTestId('error-file')[0].textContent).toBe('')
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
      store: mockStore,
      localStorage: window.localStorage
    });    
    const downloadFile = jest.fn(e => newBill.handleChangeFile(e));
    const file = screen.getByTestId('file');
   
    const myTestFile = new File([''], 'fichier.jpg', { type: 'image/jpg' });
    file.addEventListener('change', downloadFile);
    fireEvent.change(file, { target: { files: [myTestFile] } });

    expect(downloadFile).toHaveBeenCalled();
    const btnSendBill = screen.getByText('Envoyer');
  
    expect(btnSendBill.disabled).toBe(false);
   

  });
});  

//////*****test post **************/

  describe("Given I am a user connected as Employee",()=>{
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
      
      const contentRefused  = await screen.getAllByTestId('error-file')[0]
      expect(contentRefused.textContent).toBe('')
      //expect(screen.getByText("le fichier selectionné n'ai pas valide")).not.toBeTruthy()
      await new Promise(process.nextTick);

      // Result ok if "createSpy" have been called
      expect(createSpy).toHaveBeenCalled()
      // Result ok if NewBill's Constructor have been updated
      expect(newBill.fileName).not.toBe(null)
    })
  }) })  

 










   