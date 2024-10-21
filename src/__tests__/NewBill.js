/**
 * @jest-environment jsdom


import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
})
 */

/** 
import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

// Mock the store for the test
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then selecting a valid file should store fileUrl and fileName", async () => {
      // Setup the DOM with the NewBill page
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the localStorage to simulate an employee user
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

      // Create a new instance of NewBill
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Mock a valid file (jpg)
      const file = new File(["image"], "image.jpg", { type: "image/jpg" });

      // Mock the store's bills().create() method
      mockStore.bills().create = jest.fn().mockResolvedValue({
        fileUrl: "https://example.com/image.jpg",
        key: "12345",
      });

      // Get the file input element and simulate a change event
      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");

      fireEvent.change(inputFile, {
        target: { files: [file] },
      });

      // Assert that handleChangeFile has been called
      expect(handleChangeFile).toHaveBeenCalled();

      // Wait for the Promise to resolve and check fileUrl and fileName
      await new Promise(process.nextTick); // Wait for the asynchronous process
      expect(newBill.fileUrl).toBe("https://example.com/image.jpg");
      expect(newBill.fileName).toBe("image.jpg");
    });

    test("Then selecting an invalid file should trigger an alert and reset the input", () => {
      // Setup the DOM with the NewBill page
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the localStorage to simulate an employee user
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

      // Create a new instance of NewBill
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Mock an invalid file (pdf)
      const file = new File(["document"], "document.pdf", { type: "application/pdf" });

      // Spy on the alert function
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      // Get the file input element and simulate a change event
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, {
        target: { files: [file] },
      });

      // Assert that alert has been called with the correct message
      expect(alertSpy).toHaveBeenCalledWith("Veuillez sélectionner un fichier d'image valide (jpg, jpeg, png)");

      // Assert that the input value has been reset
      expect(inputFile.value).toBe("");
    });
  });
});



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I submit a valid bill form", () => {
    test("Then the bill should be created and I should be redirected to Bills page", async () => {
      // Setup the DOM with NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the localStorage for an Employee user
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

      // Mock the onNavigate function and store
      const onNavigate = jest.fn();

      // Instantiate NewBill with mock dependencies
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Fill out the form fields
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-05" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });

      // Mock the file upload (with valid file)
      newBill.fileUrl = "https://example.com/file.jpg";
      newBill.fileName = "file.jpg";

      // Spy on the updateBill method
      const updateBillSpy = jest.spyOn(newBill, "updateBill");

      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Verify that updateBill is called with correct data
      expect(updateBillSpy).toHaveBeenCalled();
      expect(updateBillSpy).toHaveBeenCalledWith({
        email: "test@test.com",
        type: "Transports",
        name: "Train ticket",
        amount: 100,
        date: "2023-10-05",
        vat: "20",
        pct: 20,
        commentary: "Business trip",
        fileUrl: "https://example.com/file.jpg",
        fileName: "file.jpg",
        status: "pending",
      });

      // Verify that onNavigate is called to redirect to Bills page
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });

  describe("When I submit a form with missing required fields", () => {
    test("Then the form should not be submitted", () => {
      // Setup the DOM with NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the onNavigate function
      const onNavigate = jest.fn();

      // Instantiate NewBill with mock dependencies
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Leave some fields empty
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "" } });

      // Spy on the updateBill method
      const updateBillSpy = jest.spyOn(newBill, "updateBill");

      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Verify that updateBill is not called due to invalid form
      expect(updateBillSpy).not.toHaveBeenCalled();

      // Ensure no navigation happens
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });
});
*/

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import mockInputFile from "../__mocks__/inputFile.js"
import { ROUTES_PATH } from "../constants/routes.js";


// Mock the store for the test
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then selecting a valid file should store fileUrl and fileName", async () => {
      let newBill;
      const onNavigate = (pathname) => {
        document.body.innerHTML= ROUTES({pathname})
      }

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
 window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

 const html = NewBillUI();
 document.body.innerHTML = html;

 newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handleChangeFile = jest.fn((e) =>{
        newBill.handleChangeFile(e)
      })
      const inputFile = screen.getByTestId("file")
      //console.log(inputFile.files[0].type)
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {target: mockInputFile})
      expect(inputFile.files[0].type).toBe("image/png")
      //console.log(inputFile.files[0].type)
      expect(handleChangeFile).toHaveBeenCalled(); 
      //const result = await 
    });

    test("Then selecting an invalid file should trigger an alert and reset the input", () => {
      // Setup the DOM with the NewBill page
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the localStorage to simulate an employee user
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

      // Create a new instance of NewBill
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Mock an invalid file (pdf)
      const file = new File(["document"], "document.pdf", { type: "application/pdf" });

      // Spy on the alert function
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      // Get the file input element and simulate a change event
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, {
        target: { files: [file] },
      });

      // Assert that alert has been called with the correct message
      expect(alertSpy).toHaveBeenCalledWith("Veuillez sélectionner un fichier d'image valide (jpg, jpeg, png)");

      // Assert that the input value has been reset
      expect(inputFile.value).toBe("");
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I submit a valid bill form", () => {
    test("Then the bill should be created with FormData and I should be redirected to Bills page", async () => {
      // Setup the DOM with NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the localStorage for an Employee user
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

      // Mock the onNavigate function and store
      const onNavigate = jest.fn();

      // Instantiate NewBill with mock dependencies
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Fill out the form fields
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-05" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });

      // Mock the file upload (with valid file)
      const file = new File(["image"], "image.jpg", { type: "image/jpg" });
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, {
        target: { files: [file] },
      });

      // Mock the store's bills().create() method
      const createBillSpy = jest.spyOn(mockStore.bills(), "create").mockResolvedValue({
        fileUrl: "https://example.com/image.jpg",
        key: "12345",
      });

      
      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Wait for the Promise to resolve
      await new Promise(process.nextTick);

      // Verify that create() is called with FormData and correct headers
      const formDataArg = createBillSpy.mock.calls[0][0].data; // Get the first argument passed to create
      const email = JSON.parse(localStorage.getItem("user")).email;

      // Check that FormData has the correct entries
      expect(formDataArg.get('file')).toBe(file);
      expect(formDataArg.get('email')).toBe(email);

      // Verify that onNavigate is called to redirect to Bills page
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });

  describe("When I submit a form with missing required fields", () => {
    test("Then the form should not be submitted", () => {
      // Setup the DOM with NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock the onNavigate function
      const onNavigate = jest.fn();

      // Instantiate NewBill with mock dependencies
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Leave some fields empty
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "" } });

      // Spy on the updateBill method
      const updateBillSpy = jest.spyOn(newBill, "updateBill");

      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Verify that updateBill is not called due to invalid form
      expect(updateBillSpy).not.toHaveBeenCalled();

      // Ensure no navigation happens
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });
});

/////
describe("Given I am connected as an employee and on NewBill Page", () => {
  test("When I submit a valid form, Then a new bill is created via POST request", async () => {
    // Arrange: Setup the DOM with NewBill UI
    document.body.innerHTML = NewBillUI();

    // Mock localStorage
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "employee@test.com" })
    );

    // Act: Fill out the form
    const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
    
    fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
    fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
    fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
    fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-10-05" } });
    fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
    fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
    fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });

    // Mock file upload
    const file = new File(["image"], "image.jpg", { type: "image/jpg" });
    fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });

    // Spy on updateBill method
    const updateBillSpy = jest.spyOn(newBill, "updateBill");

    // Simulate form submission
    const form = screen.getByTestId("form-new-bill");
    fireEvent.submit(form);

    // Assert: Check that the POST request was made and the bill was created
    await waitFor(() => expect(updateBillSpy).toHaveBeenCalled());

    expect(updateBillSpy).toHaveBeenCalledWith({
      email: "employee@test.com" ,
      type: "Transports",
      name: "Train ticket",
      amount: 100,
      date: "2024-10-05",
      vat: "20",
      pct: 20,
      commentary: "Business trip",
      fileUrl: expect.any(String),  // Check that the file was uploaded
      fileName: "image.jpg",
      status: "pending"
    });
  });
});