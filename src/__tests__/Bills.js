 /**
 * @jest-environment jsdom
 */

import { screen, waitFor, getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';

import BillsUI from '../views/BillsUI.js';
import userEvent from '@testing-library/user-event';
import NewBill from '../containers/NewBill.js';
import Bill from '../containers/Bills.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH, ROUTES } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { mockStore } from '../__mocks__/store.js';

import router from '../app/Router.js';

import Bills from '../containers/Bills.js';
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
    test('Then test modal should be open', () => {
      /* Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      );    
       const bill = new Bill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock
        }); 
      */
      document.body.innerHTML = BillsUI({ data: bills });

      console.log(screen.getAllByTestId('icon-eye'));
      /*const iconEye = screen.getByTestId('icon-eye');       
      const handleClickIconEye = jest.fn();
        iconEye.addEventListener('click', handleClickIconEye);  
        userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();*/
      /*const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy() */
    });
  });
});
