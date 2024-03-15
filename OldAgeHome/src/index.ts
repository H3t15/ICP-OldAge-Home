import {
    Canister,
    Record,
    text,
    nat8,
    Principal,
    Opt,
    None,
    StableBTreeMap,
    update,
    query,
    Result,
    Vec,
    init,
  } from "azle";
  import { v4 as uuidv4 } from "uuid";
  
  // Enumeration for gender options
  enum Gender {
    Male = "male",
    Female = "female",
  }
  
  // Record type for representing a resident
  const Resident = Record({
    id: text,
    name: text,
    age: nat8,
    medicalHistory: text,
    emergencyContact: text,
    healthcareInfo: text,
    medications: Vec(text), // List of medications
  });
  
  type Resident = typeof Resident.tsType;
  
  // Record type for representing an appointment
  const Appointment = Record({
    id: text,
    residentId: text,
    date: text,
    description: text,
  });
  
  type Appointment = typeof Appointment.tsType;
  
  // Record type for representing a resource allocation
  const ResourceAllocation = Record({
    id: text,
    residentId: text,
    resource: text,
    quantity: nat8,
  });
  
  type ResourceAllocation = typeof ResourceAllocation.tsType;
  
  // Single-value data are stored in `StableBTreeMap` to preserve them across canister upgrades
  // This data will be stored and retrieved using constant keys
  const OWNER_KEY: text = "owner";
  const MAX_CAPACITY_KEY: text = "max_capacity";
  
  // Storage variables
  const owner = StableBTreeMap<text, Principal>(0);
  const maxCapacity = StableBTreeMap<text, nat8>(0);
  const residents = StableBTreeMap<text, Resident>(0);
  const appointments = StableBTreeMap<text, Appointment>(0);
  const resourceAllocations = StableBTreeMap<text, ResourceAllocation>(0);
  
  export default Canister({
    /**
     * Initializes the canister and sets the owner of the old age home
     */
    init: init([], () => {
      owner.insert(OWNER_KEY, ic.caller());
      maxCapacity.insert(MAX_CAPACITY_KEY, 50); // Setting initial max capacity
    }),
  
    // Functions for managing residents
  
    // ...
  
    // Functions for managing appointments
  
    // ...
  
    // Functions for managing medication
  
    /**
     * Adds medication to a resident
     * @param residentId - Resident's ID
     * @param medication - Medication name
     * @returns optional error
     */
    addMedication: update([text, text], Opt(text), (residentId, medication) => {
      // Check if the resident exists
      if (!residents.containsKey(residentId)) {
        return Some("Resident not found");
      }
  
      // Add medication to the resident
      const resident = residents.get(residentId).unwrap();
      resident.medications.push(medication);
      residents.insert(residentId, resident);
  
      return None;
    }),
  
    /**
     * Removes medication from a resident
     * @param residentId - Resident's ID
     * @param medication - Medication name
     * @returns optional error
     */
    removeMedication: update(
      [text, text],
      Opt(text),
      (residentId, medication) => {
        // Check if the resident exists
        if (!residents.containsKey(residentId)) {
          return Some("Resident not found");
        }
  
        // Remove medication from the resident
        const resident = residents.get(residentId).unwrap();
        const index = resident.medications.indexOf(medication);
        if (index === -1) {
          return Some("Medication not found for the resident");
        }
        resident.medications.splice(index, 1);
        residents.insert(residentId, resident);
  
        return None;
      }
    ),
  
    // Functions for managing resource allocation
  
    /**
     * Allocates resources to a resident
     * @param residentId - Resident's ID
     * @param resource - Resource name
     * @param quantity - Quantity of the resource
     * @returns optional error
     */
    allocateResource: update(
      [text, text, nat8],
      Opt(text),
      (residentId, resource, quantity) => {
        // Check if the resident exists
        if (!residents.containsKey(residentId)) {
          return Some("Resident not found");
        }
  
        // Allocate resource to the resident
        const id = uuidv4();
        const allocation: ResourceAllocation = {
          id,
          residentId,
          resource,
          quantity,
        };
        resourceAllocations.insert(id, allocation);
  
        return None;
      }
    ),
  
    /**
     * Deallocates resources from a resident
     * @param allocationId - Resource allocation ID
     * @returns optional error
     */
    deallocateResource: update([text], Opt(text), (allocationId) => {
      // Check if the resource allocation exists
      if (!resourceAllocations.containsKey(allocationId)) {
        return Some("Resource allocation not found");
      }
  
      // Remove resource allocation
      resourceAllocations.remove(allocationId);
  
      return None;
    }),
  
    // Additional functions can be added here...
  
  });
  
  // Helper function to get the current resident count
  function getCurrentResidentCount(): number {
    return residents.size();
  }
  
  // Helper function to get the maximum capacity of the old age home
  function getMaxCapacity(): number {
    return maxCapacity.get(MAX_CAPACITY_KEY).unwrap();
  }
  