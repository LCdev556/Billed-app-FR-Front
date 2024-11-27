/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent, waitForElementToBeRemoved} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import Bills from "../containers/Bills.js"

import NewBillUI from "../views/NewBillUI";
import NewBill from "../containers/NewBill";


import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      expect(windowIcon.classList).toContain('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", async () => {
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
      const sortedBills = await billsInstance.getBills();

      document.body.innerHTML = BillsUI({ data: sortedBills });
      const dates = Array.from(document.querySelectorAll("tbody tr td:nth-child(3)")).map(td => td.innerHTML);
      const datesExpected = sortedBills.map(bill => bill.date);
      expect(dates).toEqual(datesExpected);
      expect(bills.length).toBe(4)
    })
  })
})


 
describe("Given I am connected as an employee", () => {
  
  describe("When I am on Bills Page", () => {
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.com"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy();
    })
  })
  })
})


//

test("When I click on 'New Bill' button, it should navigate to NewBill page", () => {
  
  const buttonNewBill = document.createElement("button");
  buttonNewBill.setAttribute("data-testid", "btn-new-bill");
  document.body.append(buttonNewBill);

  const onNavigate = jest.fn();
  const billsInstance = new Bills({
    document,
    onNavigate,
    store: null,
    localStorage: window.localStorage,
  });

  
  buttonNewBill.addEventListener("click", billsInstance.handleClickNewBill);
  buttonNewBill.click();

  expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
});


test("When I fetch bills with corrupted data, it should log an error but still return bills", async () => {
  const corruptedBills = [
    { date: "invalid-date", status: "accepted" }, 
    { date: "2023-09-12", status: "unknown-status" } 
  ];

  mockStore.bills.mockImplementationOnce(() => ({
    list: () => Promise.resolve(corruptedBills)
  }));

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  const billsInstance = new Bills({
    document,
    onNavigate: jest.fn(),
    store: mockStore,
    localStorage: window.localStorage,
  });

  const bills = await billsInstance.getBills();

  
  expect(bills.length).toBe(2);
  expect(consoleSpy).toHaveBeenCalled();

  consoleSpy.mockRestore();
});

test("When there are no bills, it should return an empty array", async () => {
  mockStore.bills.mockImplementationOnce(() => ({
    list: () => Promise.resolve([])
  }));

  const billsInstance = new Bills({
    document,
    onNavigate: jest.fn(),
    store: mockStore,
    localStorage: window.localStorage,
  });

  const bills = await billsInstance.getBills();

  expect(bills.length).toBe(0);
});

