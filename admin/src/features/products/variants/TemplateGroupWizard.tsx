import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  TagIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  CubeIcon,
  SwatchIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface TemplateGroupWizardProps {
  productId: string;
  productSku: string;
  productName: string;
  onComplete: (templates: any) => void;
  onCancel: () => void;
}

interface TemplateGroup {
  id: string;
  name: string;
  category: string;
  icon?: string;
  values: string[];
  description?: string;
  isCustom?: boolean;
}

// Predefined template groups (can be extended by user)
const defaultTemplateGroups: TemplateGroup[] = [
  // Apparel & Fashion
  {
    id: 'sizes',
    name: 'Standard Sizes',
    category: 'Apparel &