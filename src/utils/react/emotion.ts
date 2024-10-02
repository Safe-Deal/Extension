import styled from "@emotion/styled"

const shouldForwardProp = (prop) => !["bg", "border"].includes(prop)

export const em = (component) => styled(component, { shouldForwardProp })
