/**
 * Helper function to validate text inputs for blank spaces
 * @param formElement - The form element to validate
 * @param fieldNames - Array of field names to check
 * @returns Object with validation result and invalid fields
 */
export const validateFormFields = (
  formElement: HTMLFormElement,
  fieldNames: string[]
): { isValid: boolean; invalidFields: string[] } => {
  const invalidFields: string[] = [];

  fieldNames.forEach((fieldName) => {
    const value = (
      formElement.elements.namedItem(fieldName) as HTMLInputElement
    )?.value;

    // Check if the value exists and is not just whitespace
    if (!value || !value.trim()) {
      invalidFields.push(fieldName);
    }
  });

  return {
    isValid: invalidFields.length === 0,
    invalidFields,
  };
};

/**
 * Applies visual indication for invalid fields
 * @param formElement - The form element containing the fields
 * @param invalidFields - Array of field names that are invalid
 */
export const markInvalidFields = (
  formElement: HTMLFormElement,
  invalidFields: string[]
): void => {
  // First reset all fields to normal state
  const allInputs = formElement.querySelectorAll(
    'input[type="text"], input[type="email"]'
  );
  allInputs.forEach((input) => {
    const element = input as HTMLElement;
    element.classList.remove("border-red-500");
  });

  // Then mark invalid fields
  invalidFields.forEach((fieldName) => {
    const element = formElement.elements.namedItem(fieldName) as HTMLElement;
    if (element) {
      element.classList.add("border-red-500");
    }
  });
};
