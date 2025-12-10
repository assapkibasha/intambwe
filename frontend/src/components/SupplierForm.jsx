// src/components/SupplierForm.jsx
import { useEffect } from 'react';
import { Form, Button, Input, Select, Space, Spin } from 'antd';

const SupplierForm = ({ supplier, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (supplier) {
      form.setFieldsValue(supplier);
    }
  }, [supplier, form]);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Supplier Name"
          rules={[{ required: true, message: 'Supplier name is required' }]}
        >
          <Input placeholder="Enter supplier name" />
        </Form.Item>

        <Form.Item
          name="contact_person"
          label="Contact Person"
        >
          <Input placeholder="Contact person name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Invalid email' }]}
        >
          <Input placeholder="supplier@example.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
        >
          <Input placeholder="Phone number" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
        >
          <Input.TextArea rows={2} placeholder="Full address" />
        </Form.Item>

        <Form.Item
          name="city"
          label="City"
        >
          <Input placeholder="City" />
        </Form.Item>

        <Form.Item
          name="country"
          label="Country"
        >
          <Input placeholder="Country" />
        </Form.Item>

        <Form.Item
          name="payment_terms"
          label="Payment Terms"
        >
          <Input placeholder="Payment terms (e.g., Net 30)" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {supplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
          <Button>Cancel</Button>
        </Space>
      </Form>
    </Spin>
  );
};

export default SupplierForm;
