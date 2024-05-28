import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { ICategory } from "@/lib/database/models/category.model"
import { startTransition, useEffect, useState } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { createCategory, getAllCategories } from "@/lib/actions/category.action"
  
  

type DropdownProps = {
    value?: string
    onChangeHandler?: () => void
}

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
    const [categories, setCategories] = useState<ICategory[]>([])
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
      createCategory({
        categoryName: newCategory.trim()
      })
        .then((category) => {
          setCategories((prevState) => [...prevState, category])
        })  
    }

    useEffect(() => {
      const getCategories = async () => {
        const categoryList = await getAllCategories();

        categoryList && setCategories(categoryList as ICategory[])
      }

      getCategories();
    }, [])


  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
        <SelectTrigger className="select-field">
            <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
            {categories.length > 0 && categories.map((category) => (
                <SelectItem key={category._id} value={category._id}
                className="select-item p-regular-14">
                    {category.name}
                </SelectItem>
            ))}

<Dialog>
  <DialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">Add new category</DialogTrigger>
  <DialogContent className="bg-white">
    <DialogHeader>
      <DialogTitle>New Category</DialogTitle>
      <DialogDescription>
        <Input type="text" placeholder="Category name" className="input-field mt-3" onChange={(e) => setNewCategory(e.target.value)}/>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <Button onClick={() => startTransition(handleAddCategory)}>Add</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
   
        </SelectContent>
    </Select>

  )
}

export default Dropdown