// src/components/InventoryItemForm.jsx
import { useState, useEffect } from 'react';
import { Form, Button, Select, InputNumber, Input, DatePicker, Space, Spin } from 'antd';
import dayjs from 'dayjs';

const InventoryItemForm = ({ item, categories, suppliers, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        ...item,
        expiry_date: item.expiry_date ? dayjs(item.expiry_date) : null,
        warranty_expiry_date: item.warranty_expiry_date ? dayjs(item.warranty_expiry_date) : null,
      });
    }
  }, [item, form]);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Item Name"
          rules={[{ required: true, message: 'Item name is required' }]}
        >
          <Input placeholder="Enter item name" />
        </Form.Item>

        <Form.Item
          name="stock_keeping_unit"
          label="SKU"
        >
          <Input placeholder="Stock keeping unit" />
        </Form.Item>

        <Form.Item
          name="barcode"
          label="Barcode"
        >
          <Input placeholder="Barcode" />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
        >
          <Select placeholder="Select category" allowClear>
            {categories?.map(cat => (
              <Select.Option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="supplier_id"
          label="Supplier"
        >
          <Select placeholder="Select supplier" allowClear>
            {suppliers?.map(sup => (
              <Select.Option key={sup.supplier_id} value={sup.supplier_id}>
                {sup.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: 'Quantity is required' }]}
        >
          <InputNumber min={0} placeholder="0" />
        </Form.Item>

        <Form.Item
          name="minimum_stock_level"
          label="Minimum Stock Level"
        >
          <InputNumber min={0} placeholder="10" />
        </Form.Item>

        <Form.Item
          name="unit_type"
          label="Unit Type"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select unit">
            <Select.Option value="pieces">Pieces</Select.Option>
            <Select.Option value="boxes">Boxes</Select.Option>
            <Select.Option value="kg">Kilograms</Select.Option>
            <Select.Option value="liters">Liters</Select.Option>
            <Select.Option value="meters">Meters</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="unit_price"
          label="Unit Price"
        >
          <InputNumber min={0} step={0.01} placeholder="0.00" />
        </Form.Item>

        <Form.Item
          name="expiry_date"
          label="Expiry Date"
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="warranty_expiry_date"
          label="Warranty Expiry Date"
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Item description" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
        >
          <Select placeholder="Select status">
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="discontinued">Discontinued</Select.Option>
          </Select>
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {item ? 'Update Item' : 'Add Item'}
          </Button>
          <Button>Cancel</Button>
        </Space>
      </Form>
    </Spin>
  );
};

export default InventoryItemForm;
