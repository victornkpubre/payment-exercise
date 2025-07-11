
export const getAccountId = (token: string):number => {
    return tokenValidationMock[token];
} 


const tokenValidationMock: Record<string, number> = {
    'tok_4242' : 0,
    'tok_1422' : 1,
    'tok_2344' : 2,
    'tok_4654' : 3,
    'tok_8765' : 4,
}