import bcrypt from "bcryptjs";

export const hashValue = async (value, saltRounds=10) =>{
  try {
    console.log("Hashing value:", value, "with salt rounds:", saltRounds);
    return await bcrypt.hash(value, saltRounds);
  } catch (error) {
    console.error("Error hashing value:", error);
    throw error;
  }
}

export const compareValue = async (value, hashedValue) =>{
  try {
    console.log("Comparing value:", value, "with hashed value:", hashedValue);
    return await bcrypt.compare(value, hashedValue);
  } catch (error) {
    console.error("Error comparing value:", error);
    throw error;
  }
}