import bcrypt from 'bcrypt';

const hashPW = plaintext => {
  bcrypt.genSalt(10, (saltErr, salt) => {
    if (saltErr) {
      console.error.bind(console, `error generating salt: ${saltErr}`);
      return { error: saltErr };
    } else {
      bcrypt.hash(plaintext, salt, (hashErr, hash) => {
        if (hashErr) {
          console.error.bind(console, `error hashing plaintext: ${hashErr}`);
          return { error: hashErr };
        } else {
          return { hash };
        }
      });
    }
  });
};

export { hashPW }
