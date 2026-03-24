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

const { success, data, error } = o.safeParse({
    email: 'fnjdvhcom',
    password: 32,
});
console.log(z.flattenError(error).fieldErrors);
console.log(
    o.safeParse({
        email: 'fnjdvhf@gmail.com',
        password: "32",
        age:12
    }),
);
