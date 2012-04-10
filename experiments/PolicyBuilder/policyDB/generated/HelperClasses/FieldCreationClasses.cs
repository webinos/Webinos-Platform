///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:07
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.FactoryClasses;
using policyDB;

namespace policyDB.HelperClasses
{
	/// <summary>Field Creation Class for entity AttributeEntity</summary>
	public partial class AttributeFields
	{
		/// <summary>Creates a new AttributeEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeFieldIndex.Id);}
		}
		/// <summary>Creates a new AttributeEntity.AttributeTypeId field instance</summary>
		public static EntityField AttributeTypeId
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeFieldIndex.AttributeTypeId);}
		}
		/// <summary>Creates a new AttributeEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeFieldIndex.Name);}
		}
		/// <summary>Creates a new AttributeEntity.ContextId field instance</summary>
		public static EntityField ContextId
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeFieldIndex.ContextId);}
		}
	}

	/// <summary>Field Creation Class for entity AttributeTypeEntity</summary>
	public partial class AttributeTypeFields
	{
		/// <summary>Creates a new AttributeTypeEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeTypeFieldIndex.Id);}
		}
		/// <summary>Creates a new AttributeTypeEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeTypeFieldIndex.Name);}
		}
	}

	/// <summary>Field Creation Class for entity AttributeValueEntity</summary>
	public partial class AttributeValueFields
	{
		/// <summary>Creates a new AttributeValueEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeValueFieldIndex.Id);}
		}
		/// <summary>Creates a new AttributeValueEntity.AttributeMatchId field instance</summary>
		public static EntityField AttributeMatchId
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeValueFieldIndex.AttributeMatchId);}
		}
		/// <summary>Creates a new AttributeValueEntity.AttributeId field instance</summary>
		public static EntityField AttributeId
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeValueFieldIndex.AttributeId);}
		}
		/// <summary>Creates a new AttributeValueEntity.Value field instance</summary>
		public static EntityField Value
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeValueFieldIndex.Value);}
		}
		/// <summary>Creates a new AttributeValueEntity.Literal field instance</summary>
		public static EntityField Literal
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeValueFieldIndex.Literal);}
		}
		/// <summary>Creates a new AttributeValueEntity.Order field instance</summary>
		public static EntityField Order
		{
			get { return (EntityField)EntityFieldFactory.Create(AttributeValueFieldIndex.Order);}
		}
	}

	/// <summary>Field Creation Class for entity CombineModeEntity</summary>
	public partial class CombineModeFields
	{
		/// <summary>Creates a new CombineModeEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(CombineModeFieldIndex.Id);}
		}
		/// <summary>Creates a new CombineModeEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(CombineModeFieldIndex.Name);}
		}
	}

	/// <summary>Field Creation Class for entity ContextEntity</summary>
	public partial class ContextFields
	{
		/// <summary>Creates a new ContextEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(ContextFieldIndex.Id);}
		}
		/// <summary>Creates a new ContextEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(ContextFieldIndex.Name);}
		}
	}

	/// <summary>Field Creation Class for entity DecisionNodeEntity</summary>
	public partial class DecisionNodeFields
	{
		/// <summary>Creates a new DecisionNodeEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.Id);}
		}
		/// <summary>Creates a new DecisionNodeEntity.ParentId field instance</summary>
		public static EntityField ParentId
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.ParentId);}
		}
		/// <summary>Creates a new DecisionNodeEntity.Type field instance</summary>
		public static EntityField Type
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.Type);}
		}
		/// <summary>Creates a new DecisionNodeEntity.CombineAnd field instance</summary>
		public static EntityField CombineAnd
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.CombineAnd);}
		}
		/// <summary>Creates a new DecisionNodeEntity.AttributeId field instance</summary>
		public static EntityField AttributeId
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.AttributeId);}
		}
		/// <summary>Creates a new DecisionNodeEntity.Extra field instance</summary>
		public static EntityField Extra
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.Extra);}
		}
		/// <summary>Creates a new DecisionNodeEntity.Order field instance</summary>
		public static EntityField Order
		{
			get { return (EntityField)EntityFieldFactory.Create(DecisionNodeFieldIndex.Order);}
		}
	}

	/// <summary>Field Creation Class for entity EffectEntity</summary>
	public partial class EffectFields
	{
		/// <summary>Creates a new EffectEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(EffectFieldIndex.Id);}
		}
		/// <summary>Creates a new EffectEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(EffectFieldIndex.Name);}
		}
	}

	/// <summary>Field Creation Class for entity LibraryEntity</summary>
	public partial class LibraryFields
	{
		/// <summary>Creates a new LibraryEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(LibraryFieldIndex.Id);}
		}
		/// <summary>Creates a new LibraryEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(LibraryFieldIndex.Name);}
		}
		/// <summary>Creates a new LibraryEntity.Locked field instance</summary>
		public static EntityField Locked
		{
			get { return (EntityField)EntityFieldFactory.Create(LibraryFieldIndex.Locked);}
		}
	}

	/// <summary>Field Creation Class for entity PolicyEntity</summary>
	public partial class PolicyFields
	{
		/// <summary>Creates a new PolicyEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.Id);}
		}
		/// <summary>Creates a new PolicyEntity.LibraryId field instance</summary>
		public static EntityField LibraryId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.LibraryId);}
		}
		/// <summary>Creates a new PolicyEntity.Uid field instance</summary>
		public static EntityField Uid
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.Uid);}
		}
		/// <summary>Creates a new PolicyEntity.Description field instance</summary>
		public static EntityField Description
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.Description);}
		}
		/// <summary>Creates a new PolicyEntity.TargetId field instance</summary>
		public static EntityField TargetId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.TargetId);}
		}
		/// <summary>Creates a new PolicyEntity.CombineModeId field instance</summary>
		public static EntityField CombineModeId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.CombineModeId);}
		}
		/// <summary>Creates a new PolicyEntity.Set field instance</summary>
		public static EntityField Set
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.Set);}
		}
		/// <summary>Creates a new PolicyEntity.IsLibrary field instance</summary>
		public static EntityField IsLibrary
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyFieldIndex.IsLibrary);}
		}
	}

	/// <summary>Field Creation Class for entity PolicyDocumentEntity</summary>
	public partial class PolicyDocumentFields
	{
		/// <summary>Creates a new PolicyDocumentEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyDocumentFieldIndex.Id);}
		}
		/// <summary>Creates a new PolicyDocumentEntity.LibraryId field instance</summary>
		public static EntityField LibraryId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyDocumentFieldIndex.LibraryId);}
		}
		/// <summary>Creates a new PolicyDocumentEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyDocumentFieldIndex.Name);}
		}
		/// <summary>Creates a new PolicyDocumentEntity.PolicyLinkId field instance</summary>
		public static EntityField PolicyLinkId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyDocumentFieldIndex.PolicyLinkId);}
		}
	}

	/// <summary>Field Creation Class for entity PolicyLinkEntity</summary>
	public partial class PolicyLinkFields
	{
		/// <summary>Creates a new PolicyLinkEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyLinkFieldIndex.Id);}
		}
		/// <summary>Creates a new PolicyLinkEntity.PolicyId field instance</summary>
		public static EntityField PolicyId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyLinkFieldIndex.PolicyId);}
		}
		/// <summary>Creates a new PolicyLinkEntity.ParentId field instance</summary>
		public static EntityField ParentId
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyLinkFieldIndex.ParentId);}
		}
		/// <summary>Creates a new PolicyLinkEntity.Order field instance</summary>
		public static EntityField Order
		{
			get { return (EntityField)EntityFieldFactory.Create(PolicyLinkFieldIndex.Order);}
		}
	}

	/// <summary>Field Creation Class for entity QueryEntity</summary>
	public partial class QueryFields
	{
		/// <summary>Creates a new QueryEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryFieldIndex.Id);}
		}
		/// <summary>Creates a new QueryEntity.LibraryId field instance</summary>
		public static EntityField LibraryId
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryFieldIndex.LibraryId);}
		}
		/// <summary>Creates a new QueryEntity.Description field instance</summary>
		public static EntityField Description
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryFieldIndex.Description);}
		}
	}

	/// <summary>Field Creation Class for entity QueryValueEntity</summary>
	public partial class QueryValueFields
	{
		/// <summary>Creates a new QueryValueEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryValueFieldIndex.Id);}
		}
		/// <summary>Creates a new QueryValueEntity.QueryId field instance</summary>
		public static EntityField QueryId
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryValueFieldIndex.QueryId);}
		}
		/// <summary>Creates a new QueryValueEntity.AttributeId field instance</summary>
		public static EntityField AttributeId
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryValueFieldIndex.AttributeId);}
		}
		/// <summary>Creates a new QueryValueEntity.Extra field instance</summary>
		public static EntityField Extra
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryValueFieldIndex.Extra);}
		}
		/// <summary>Creates a new QueryValueEntity.Value field instance</summary>
		public static EntityField Value
		{
			get { return (EntityField)EntityFieldFactory.Create(QueryValueFieldIndex.Value);}
		}
	}

	/// <summary>Field Creation Class for entity RuleEntity</summary>
	public partial class RuleFields
	{
		/// <summary>Creates a new RuleEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(RuleFieldIndex.Id);}
		}
		/// <summary>Creates a new RuleEntity.PolicyId field instance</summary>
		public static EntityField PolicyId
		{
			get { return (EntityField)EntityFieldFactory.Create(RuleFieldIndex.PolicyId);}
		}
		/// <summary>Creates a new RuleEntity.EffectId field instance</summary>
		public static EntityField EffectId
		{
			get { return (EntityField)EntityFieldFactory.Create(RuleFieldIndex.EffectId);}
		}
		/// <summary>Creates a new RuleEntity.ConditionId field instance</summary>
		public static EntityField ConditionId
		{
			get { return (EntityField)EntityFieldFactory.Create(RuleFieldIndex.ConditionId);}
		}
		/// <summary>Creates a new RuleEntity.Order field instance</summary>
		public static EntityField Order
		{
			get { return (EntityField)EntityFieldFactory.Create(RuleFieldIndex.Order);}
		}
	}

	/// <summary>Field Creation Class for entity TargetEntity</summary>
	public partial class TargetFields
	{
		/// <summary>Creates a new TargetEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(TargetFieldIndex.Id);}
		}
		/// <summary>Creates a new TargetEntity.Description field instance</summary>
		public static EntityField Description
		{
			get { return (EntityField)EntityFieldFactory.Create(TargetFieldIndex.Description);}
		}
	}

	/// <summary>Field Creation Class for entity TargetConditionEntity</summary>
	public partial class TargetConditionFields
	{
		/// <summary>Creates a new TargetConditionEntity.TargetId field instance</summary>
		public static EntityField TargetId
		{
			get { return (EntityField)EntityFieldFactory.Create(TargetConditionFieldIndex.TargetId);}
		}
		/// <summary>Creates a new TargetConditionEntity.ConditionId field instance</summary>
		public static EntityField ConditionId
		{
			get { return (EntityField)EntityFieldFactory.Create(TargetConditionFieldIndex.ConditionId);}
		}
	}

	/// <summary>Field Creation Class for entity UriComponentEntity</summary>
	public partial class UriComponentFields
	{
		/// <summary>Creates a new UriComponentEntity.Id field instance</summary>
		public static EntityField Id
		{
			get { return (EntityField)EntityFieldFactory.Create(UriComponentFieldIndex.Id);}
		}
		/// <summary>Creates a new UriComponentEntity.Name field instance</summary>
		public static EntityField Name
		{
			get { return (EntityField)EntityFieldFactory.Create(UriComponentFieldIndex.Name);}
		}
	}
	

}