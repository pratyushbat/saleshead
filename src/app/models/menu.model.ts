import { SimpleResponse } from "./genericResponse.model"

export interface Menus {
  menuItemID: number
  menuParentID: number
  text: string
  url: string
  icon: string
  Role: number
  userRole: number
  items: Menus[]
    }

export interface MenuResponse extends SimpleResponse
{
 menus: Menus[]

}
