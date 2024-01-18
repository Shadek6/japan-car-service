function evaluateString(user_id: string, input: string) 
{
    if(user_id !== "320955077223383040") return "evaluateString:no-permission"

    return `\`${eval(input)}\``;
}

export { evaluateString }