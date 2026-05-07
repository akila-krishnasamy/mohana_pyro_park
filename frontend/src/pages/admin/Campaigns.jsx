import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MessageSquare, Image as ImageIcon, Send, Users, Search, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { campaignsAPI } from '../../services/api';

const Campaigns = () => {
  const [formData, setFormData] = useState({
    campaignType: 'offer',
    title: '',
    message: '',
    mediaUrl: '',
    channel: 'sms',
    recipientMode: 'all',
    search: ''
  });
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const recipientsSummaryQuery = useQuery({
    queryKey: ['campaignRecipientsSummary'],
    queryFn: campaignsAPI.getRecipientsSummary
  });

  const recipientsListQuery = useQuery({
    queryKey: ['campaignRecipientsList'],
    queryFn: () => campaignsAPI.getRecipientsList({ limit: 500 })
  });

  const recipients = recipientsListQuery.data?.recipients || [];

  const filteredRecipients = useMemo(() => {
    const q = formData.search.trim().toLowerCase();
    if (!q) return recipients;

    return recipients.filter((recipient) =>
      [recipient.name, recipient.phone, recipient.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [recipients, formData.search]);

  const allFilteredIds = filteredRecipients.map((recipient) => recipient._id);
  const allFilteredSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedRecipientIds.includes(id));

  const sendMutation = useMutation({
    mutationFn: campaignsAPI.sendToCustomers,
    onSuccess: (data) => {
      toast.success(data.message || 'Campaign sent');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  });

  useEffect(() => {
    if (!sendMutation.isSuccess) return;
    setFormData((prev) => ({
      ...prev,
      title: '',
      message: '',
      mediaUrl: ''
    }));
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
  }, [sendMutation.isSuccess]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleToggleRecipient = (recipientId) => {
    setSelectedRecipientIds((prev) => (
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    ));
  };

  const handleToggleSelectFiltered = () => {
    if (allFilteredSelected) {
      setSelectedRecipientIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
      return;
    }

    const merged = new Set([...selectedRecipientIds, ...allFilteredIds]);
    setSelectedRecipientIds([...merged]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error('Please enter campaign message');
      return;
    }

    if (formData.recipientMode === 'selected' && selectedRecipientIds.length === 0) {
      toast.error('Select at least one customer');
      return;
    }

    const payload = new FormData();
    payload.append('campaignType', formData.campaignType);
    payload.append('title', formData.title.trim());
    payload.append('message', formData.message.trim());
    payload.append('mediaUrl', formData.mediaUrl.trim());
    payload.append('channel', formData.channel);
    payload.append('recipientIds', JSON.stringify(formData.recipientMode === 'selected' ? selectedRecipientIds : []));
    if (imageFile) payload.append('image', imageFile);

    sendMutation.mutate(payload);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImageFile(null);
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const summary = recipientsSummaryQuery.data || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Customer Campaigns</h1>
        </div>
        <p className="text-sm text-gray-500">
          Send offers, vouchers and reminder messages via Twilio to all customers or only selected customers.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <Users className="w-5 h-5" />
          <span className="font-medium">Recipients Overview</span>
        </div>

        {recipientsSummaryQuery.isLoading ? (
          <p className="text-gray-500 text-sm">Loading recipient count...</p>
        ) : (
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="rounded-lg bg-primary-50 p-4 border border-primary-100">
              <p className="text-xs text-primary-700">Registered Customers</p>
              <p className="text-2xl font-bold text-primary-900">{summary.totalCustomers || 0}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 border border-green-100">
              <p className="text-xs text-green-700">Valid Phone Numbers</p>
              <p className="text-2xl font-bold text-green-900">{summary.validNumbers || 0}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
              <p className="text-xs text-blue-700">Valid Emails</p>
              <p className="text-2xl font-bold text-blue-900">{summary.validEmails || 0}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
              <p className="text-xs text-amber-700">Selected Now</p>
              <p className="text-2xl font-bold text-amber-900">{selectedRecipientIds.length}</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type *</label>
            <select
              className="input"
              value={formData.campaignType}
              onChange={(e) => setFormData((prev) => ({ ...prev, campaignType: e.target.value }))}
            >
              <option value="offer">Offer</option>
              <option value="voucher">Voucher</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel *</label>
            <select
              className="input"
              value={formData.channel}
              onChange={(e) => setFormData((prev) => ({ ...prev, channel: e.target.value }))}
            >
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Send To *</label>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, recipientMode: 'all' }))}
              className={`rounded-lg border px-4 py-3 text-left ${formData.recipientMode === 'all' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
            >
              <p className="font-medium text-gray-900">All Registered Customers</p>
              <p className="text-xs text-gray-500">
                {formData.channel === 'email'
                  ? 'Email goes to every active customer with an email address.'
                  : 'Message goes to every active customer with a phone number.'}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, recipientMode: 'selected' }))}
              className={`rounded-lg border px-4 py-3 text-left ${formData.recipientMode === 'selected' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
            >
              <p className="font-medium text-gray-900">Selected Customers Only</p>
              <p className="text-xs text-gray-500">Pick exactly who should receive this message.</p>
            </button>
          </div>
        </div>

        {formData.recipientMode === 'selected' && (
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="Search by name, phone or email"
                  value={formData.search}
                  onChange={(e) => setFormData((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <button
                type="button"
                className="btn-secondary flex items-center gap-2"
                onClick={handleToggleSelectFiltered}
              >
                <CheckSquare className="w-4 h-4" />
                {allFilteredSelected ? 'Unselect Filtered' : 'Select Filtered'}
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto bg-white rounded-lg border divide-y">
              {recipientsListQuery.isLoading && <p className="p-3 text-sm text-gray-500">Loading customers...</p>}
              {!recipientsListQuery.isLoading && filteredRecipients.length === 0 && (
                <p className="p-3 text-sm text-gray-500">No customers found for this search.</p>
              )}

              {filteredRecipients.map((recipient) => {
                const isChecked = selectedRecipientIds.includes(recipient._id);
                return (
                  <label key={recipient._id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleRecipient(recipient._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{recipient.name}</p>
                      <p className="text-xs text-gray-500">{recipient.phone} {recipient.email ? `| ${recipient.email}` : ''}</p>
                    </div>
                    {formData.channel === 'email' && !recipient.isValidEmail && (
                      <span className="text-xs text-red-600">Invalid email</span>
                    )}
                    {formData.channel !== 'email' && !recipient.isValidPhone && (
                      <span className="text-xs text-red-600">Invalid phone</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
          <input
            type="text"
            className="input"
            placeholder="Festival Offer"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            className="input"
            rows={5}
            placeholder="Type your offer/voucher/reminder message"
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            required
          />
        </div>

        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              className="input pl-10"
              placeholder="https://..."
              value={formData.mediaUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, mediaUrl: e.target.value }))}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">For WhatsApp, this URL will be sent as media attachment.</p>

          <p className="text-xs text-gray-500 mt-3 mb-1">Or upload image file (max 5MB)</p>
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <div className="mt-3 flex justify-center">
              <img
                src={imagePreview}
                alt="Campaign preview"
                className="max-h-44 rounded-lg border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={sendMutation.isPending || recipientsSummaryQuery.isLoading}
        >
          <Send className="w-4 h-4" />
          {sendMutation.isPending ? 'Sending...' : 'Send Campaign'}
        </button>
      </form>

      {sendMutation.data?.totals && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Last Campaign Result</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg bg-gray-50 p-3 border">
              <p className="text-xs text-gray-500">Targeted</p>
              <p className="text-xl font-bold text-gray-900">{sendMutation.data.totals.customers}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 border border-green-200">
              <p className="text-xs text-green-700">Sent</p>
              <p className="text-xl font-bold text-green-900">{sendMutation.data.totals.sent}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-xs text-red-700">Failed</p>
              <p className="text-xl font-bold text-red-900">{sendMutation.data.totals.failed}</p>
            </div>
          </div>

          {sendMutation.data.failures?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Failed Recipients (first 20)</p>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {sendMutation.data.failures.map((row, index) => (
                  <div key={`${row.phone || row.email || index}-${index}`} className="px-3 py-2 border-b last:border-b-0 text-sm">
                    <span className="font-medium">{row.customer}</span> ({row.phone || row.email || 'N/A'}) - {row.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
