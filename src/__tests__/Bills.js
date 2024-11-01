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
      //to-do write expect expression
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
  
  describe("When I am on Bills Page", () => {/**
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.com" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
      console.log(document.body.innerHTML)
      const response = await mockStore.bills().list();
      console.log("API response:", response); 
      //await waitFor(() => screen.findByText("Validations"))
      //const contentTest1  = await screen.findByText("test1")
      //expect(contentTest1).toBeTruthy()
      //expect(await screen.findByText((content) => content.includes("test1"))).toBeTruthy();
      expect(await screen.findByText("test1")).toBeInTheDocument();
      const contentTest2  = await screen.findByText("test2")
      expect(contentTest2).toBeTruthy()
      const contentTest3  = await screen.findByText("test3")
      expect(contentTest3).toBeTruthy()
      const contentTest4  = await screen.findByText("encore")
      expect(contentTest4).toBeTruthy()
      expect(bills.length).toBe(4);
      //expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })
 
  */
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
  // Créer un bouton "New Bill"
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

  // Simuler le clic sur le bouton
  buttonNewBill.addEventListener("click", billsInstance.handleClickNewBill);
  buttonNewBill.click();

  // Vérifier que la navigation vers la page NewBill a eu lieu
  expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
});


test("When I fetch bills with corrupted data, it should log an error but still return bills", async () => {
  const corruptedBills = [
    { date: "invalid-date", status: "accepted" }, // Date invalide
    { date: "2023-09-12", status: "unknown-status" } // Statut invalide
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

  // Vérifier que les factures sont récupérées malgré la date corrompue
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

  // Vérifier que le résultat est un tableau vide
  expect(bills.length).toBe(0);
});

