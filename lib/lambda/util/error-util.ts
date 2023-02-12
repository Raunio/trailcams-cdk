export const errorUtil = {
  handleError: (error: unknown) => {
    if (!(error instanceof Error)) {
      throw new Error("An unknown error occured.");
    }

    console.log(error.stack);
    console.log(error.message);

    throw error;
  },
};
