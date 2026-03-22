import * as z from 'zod';

const s = z
    .string('please enter a valid string')
    .min(5, 'please enter 3 characters ')
    .max(10)
    .toLowerCase();
// .email();

const o = z.object({
    name: z.string().optional(),
    email: z.email(),
    password: z.string(),
});

console.log(s.safeParse('ABCdefW'));

console.log(o.safeParse({
    name:"dmfnv",
    email:"fnjdvhf@gmail.com",
    password:"fdcs"
}))
