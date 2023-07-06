export class UserDto {
  firstName
  lastName
  email
  city
  id
  constructor(model) {
    this.id = model.userId
    this.email = model.email
    this.firstName = model.firstName
    this.city = model.city
    this.lastName = model.lastName
  }
}
