import React from "react"
import Icon from "../icon/Icon"

export type NavbarItemPropType = {
  data: {
    id: string,
    icon: string
  }
}

const NavbarItem: React.FC<NavbarItemPropType> = (props) => {
  const { data } = props;
  return (
    <div>
      <Icon data={data} />
    </div>
  )
}

export default NavbarItem