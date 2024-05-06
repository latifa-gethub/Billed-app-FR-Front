 /**
 * @jest-environment jsdom
 */
 
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bill from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
jest.mock('../app/store', () => mockStore);
 describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map(a => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    describe('when I click on new bill button', () => {
      test('Then handleClickNewBill method is called', () => {
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        });

        const newBill = screen.getByTestId('btn-new-bill');
        const handleClickNewBill = jest.fn(bill.handleClickNewBill());
        newBill.addEventListener('click', handleClickNewBill);
        userEvent.click(newBill);

        expect(handleClickNewBill).toHaveBeenCalled();
         document.body.innerHTML = '';  
      });
    });
  });
}); 
 
describe('Given I am connected as an employee,and i am in bills page', () => {
  describe('when I click on icon eye', () => {
    test('Then test modal should be open', async() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: "Employee"
        })
      )
      document.body.innerHTML = BillsUI({ data: bills })
      const bill = new Bill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn()
      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eye))
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    });
  });
});
/********Test d'integration Get************/

describe("Given I am a user connected as Employee",()=>{
  describe("When I navigate to Bills",()=>{
    test("Then fetches bills from mock API GET",async()=>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBills = new Bill({ document, onNavigate, store:mockStore, localStorage:localStorageMock })
      // Simulation function for getBills method
      const getBillsMock = jest.fn(()=>newBills.getBills())
      const listBills = await getBillsMock()
      expect(getBillsMock).toHaveBeenCalled()

      // Result ok if the bills list render is 4
      expect(listBills.length).toBe(4)

      await waitFor(() => screen.getAllByText("Mes notes de frais"))

      // Result ok if I can see the render of the page with elements of differents bills
      expect(screen.getByText("Nouvelle note de frais")).toBeTruthy()
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy()
      expect(screen.getByText("Services en ligne")).toBeTruthy()
      expect(screen.getByText("100 €")).toBeTruthy()
      expect(screen.getByText("Billed")).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // Spy function bills of mockStore
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          "localStorage",
          { value: localStorageMock }
      )
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employe",
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 400 message error", async () => {
      //Erreur 400 (Bad Request) syntax request, ressource not found, bad URL
      // Custom implementation of the bills method that will only be executed once
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 400"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      // The code is suspended until the promise is resolved
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 400/)

      // Result ok if the message is correctly return
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 401 message error", async () => {
      //Erreur 401 (Unauthorized)
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 401"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 401/)
       // Result ok if the message is correctly return
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      //Erreur 404 (Not Found) ressource not found
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/)
      // Result ok if the message is correctly return
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 500 message error", async () => {
      //Erreur 500 (Internal Server Error) 
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/)
      // Result ok if the message is correctly return
      expect(message).toBeTruthy()
    })
  })
})


  
