import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { mockInputFile } from "../__mocks__/inputFile.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";


jest.mock("../app/store", () => mockStore);

let newBill;
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee',
  email: "test@test.com"
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      
      document.body.innerHTML = NewBillUI();
      newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
    });

    test("Then selecting an invalid file should trigger an alert and reset the input", () => {
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

    test("Then I select a type of expense", async () => {
      const selectList = screen.getByTestId('expense-type');
      await waitFor(() => selectList);
      const amount = waitFor(() => screen.getByTestId('amount'));

      expect(newBill).toBeTruthy();
      expect(selectList.children[1].textContent).toBe('Restaurants et bars');
      expect(amount).toBeTruthy;
    })

    test("Then I select a file", async () => {
      const handleChangeFile = jest.fn((e) => {
        newBill.handleChangeFile(e)
      });

      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener('change', handleChangeFile);
      fireEvent.change(inputFile, { target: mockInputFile });

      expect(inputFile.files[0].type).toBe('image/png');
      expect(handleChangeFile).toHaveBeenCalled();
    });

    test("Then I send a new bill", async () => {
      const form = screen.getByTestId("form-new-bill");

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      console.log(screen.getByTestId("expense-type").value)
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
      console.log(screen.getByTestId("expense-name").value)
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      console.log(screen.getByTestId("amount").value)
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-10-05" } });
      console.log(screen.getByTestId("datepicker").value)
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      console.log(screen.getByTestId("vat").value)
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      console.log(screen.getByTestId("pct").value)
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });
      console.log(screen.getByTestId("commentary").value)

      
      const handleChangeFile = jest.fn((e) => {
        newBill.handleChangeFile(e)
      });
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener('change', handleChangeFile);
      fireEvent.change(inputFile, { target: mockInputFile });
      console.log(inputFile.files[0].type)

      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      
      expect(form).toBeTruthy();
      expect(handleSubmit).toHaveBeenCalled();
    });

    describe("When I post a new bill", () => {
      
      beforeEach(() => {
        
        document.body.innerHTML = NewBillUI();
        newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

        const form = screen.getByTestId("form-new-bill");

      form.addEventListener("submit", newBill.handleSubmit);

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      console.log(screen.getByTestId("expense-type").value)
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
      console.log(screen.getByTestId("expense-name").value)
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      console.log(screen.getByTestId("amount").value)
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-10-05" } });
      console.log(screen.getByTestId("datepicker").value)
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      console.log(screen.getByTestId("vat").value)
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      console.log(screen.getByTestId("pct").value)
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });
      console.log(screen.getByTestId("commentary").value)

      
      const handleChangeFile = jest.fn((e) => {
        newBill.handleChangeFile(e)
      });
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener('change', handleChangeFile);
      fireEvent.change(inputFile, { target: mockInputFile });
      console.log(inputFile.files[0].type)

      const handleSubmitSpy = jest.spyOn(newBill,"handleSubmit");

      fireEvent.submit(form);
      });

      test("Then the correct data are send ", () => {

        const createSpy = jest.spyOn(mockStore.bills(), "create");
         
         waitFor(() => {
          expect(createSpy).toHaveBeenCalledWith({
            email: "employee@test.com",
            type: "Transports",
            name: "Train ticket",
            amount: 100,
            date: "2024-10-05",
            vat: "20",
            pct: 20,
            commentary: "Business trip",
            fileUrl: expect.any(String), 
            fileName: "image.jpg",
            status: "pending"
          });
        });
  
      });
      

      test("Then the user is redirected to the Bills page", () => {
        waitFor(() => {
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
        });
      });

    });
  });

  describe("When I submit a form with missing required fields", () => {
    test("Then the form should not be submitted", () => {

      document.body.innerHTML = NewBillUI();
      newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      // Leave some fields empty
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "" } });

      fireEvent.change(screen.getByTestId("vat"), { target: { value: "" } });

      // Spy on the updateBill method
      const updateBillSpy = jest.spyOn(newBill, /**"updateBill"*/"handleSubmit");

      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Verify that updateBill is not called due to invalid form
      expect(updateBillSpy).not.toHaveBeenCalled();

    });
  });

   describe("When An error occurs on API", () => {
    test("Then it should handle the API error 500 when submitting a new bill", async () => {
      
      document.body.innerHTML = NewBillUI();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      
      const mockStoreError = {
        bills: jest.fn(() => ({
          create: jest.fn(),
          update: jest.fn(() => Promise.reject(new Error("Erreur 500")))
        }))
      };
      
      newBill = new NewBill({ document, onNavigate, store: mockStoreError, localStorage: window.localStorage });
    
      
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-10-05" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });
    
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, { target: mockInputFile });
      
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
    
      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(new Error("Erreur 500")));
    
      consoleSpy.mockRestore();
    });
  
  });


  describe("handleChangeFile", () => {
    

    beforeEach(() => {
      
      document.body.innerHTML = NewBillUI();
      newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
    });
  
    test("devrait définir fileUrl, billId et fileName en cas de succès", async () => {
      const mockFile = new File(["mon-image.png"], "mon-image.png", {
        type: "image/png",
    })
      const mockResponse = { fileUrl: "https://example.com/file.png", key: "123" };
      
      jest.spyOn(newBill.store.bills(), "create").mockResolvedValue(mockResponse);

      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
            value: "C:\\fakepath\\facture.png",
            files: [mockFile]
        }
    };
  
      await newBill.handleChangeFile(mockEvent);
  
      expect(newBill.billId).toBe("123");
      expect(newBill.fileUrl).toBe("https://example.com/file.png");
      expect(newBill.fileName).toBe("facture.png");
    });
  

   });

 });
