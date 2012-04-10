///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.HelperClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END
	
	/// <summary>
	/// Singleton implementation of the FieldInfoProvider. This class is the singleton wrapper through which the actual instance is retrieved.
	/// </summary>
	/// <remarks>It uses a single instance of an internal class. The access isn't marked with locks as the FieldInfoProviderBase class is threadsafe.</remarks>
	internal sealed class FieldInfoProviderSingleton
	{
		#region Class Member Declarations
		private static readonly IFieldInfoProvider _providerInstance = new FieldInfoProviderCore();
		#endregion
		
		/// <summary>private ctor to prevent instances of this class.</summary>
		private FieldInfoProviderSingleton()
		{
		}

		/// <summary>Dummy static constructor to make sure threadsafe initialization is performed.</summary>
		static FieldInfoProviderSingleton()
		{
		}

		/// <summary>Gets the singleton instance of the FieldInfoProviderCore</summary>
		/// <returns>Instance of the FieldInfoProvider.</returns>
		public static IFieldInfoProvider GetInstance()
		{
			return _providerInstance;
		}
	}

	/// <summary>Actual implementation of the FieldInfoProvider. Used by singleton wrapper.</summary>
	internal class FieldInfoProviderCore : FieldInfoProviderBase
	{
		/// <summary>Initializes a new instance of the <see cref="FieldInfoProviderCore"/> class.</summary>
		internal FieldInfoProviderCore()
		{
			Init();
		}

		/// <summary>Method which initializes the internal datastores.</summary>
		private void Init()
		{
			base.InitClass( (17 + 0));
			InitAttributeEntityInfos();
			InitAttributeTypeEntityInfos();
			InitAttributeValueEntityInfos();
			InitCombineModeEntityInfos();
			InitContextEntityInfos();
			InitDecisionNodeEntityInfos();
			InitEffectEntityInfos();
			InitLibraryEntityInfos();
			InitPolicyEntityInfos();
			InitPolicyDocumentEntityInfos();
			InitPolicyLinkEntityInfos();
			InitQueryEntityInfos();
			InitQueryValueEntityInfos();
			InitRuleEntityInfos();
			InitTargetEntityInfos();
			InitTargetConditionEntityInfos();
			InitUriComponentEntityInfos();

			base.ConstructElementFieldStructures(InheritanceInfoProviderSingleton.GetInstance());
		}

		/// <summary>Inits AttributeEntity's FieldInfo objects</summary>
		private void InitAttributeEntityInfos()
		{
			base.AddElementFieldInfo("AttributeEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)AttributeFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("AttributeEntity", "AttributeTypeId", typeof(System.Int32), false, true, false, false,  (int)AttributeFieldIndex.AttributeTypeId, 0, 0, 10);
			base.AddElementFieldInfo("AttributeEntity", "Name", typeof(System.String), false, false, false, false,  (int)AttributeFieldIndex.Name, 250, 0, 0);
			base.AddElementFieldInfo("AttributeEntity", "ContextId", typeof(System.Int32), false, true, false, false,  (int)AttributeFieldIndex.ContextId, 0, 0, 10);
		}
		/// <summary>Inits AttributeTypeEntity's FieldInfo objects</summary>
		private void InitAttributeTypeEntityInfos()
		{
			base.AddElementFieldInfo("AttributeTypeEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)AttributeTypeFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("AttributeTypeEntity", "Name", typeof(System.String), false, false, false, false,  (int)AttributeTypeFieldIndex.Name, 50, 0, 0);
		}
		/// <summary>Inits AttributeValueEntity's FieldInfo objects</summary>
		private void InitAttributeValueEntityInfos()
		{
			base.AddElementFieldInfo("AttributeValueEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)AttributeValueFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("AttributeValueEntity", "AttributeMatchId", typeof(System.Int32), false, true, false, false,  (int)AttributeValueFieldIndex.AttributeMatchId, 0, 0, 10);
			base.AddElementFieldInfo("AttributeValueEntity", "AttributeId", typeof(Nullable<System.Int32>), false, true, false, true,  (int)AttributeValueFieldIndex.AttributeId, 0, 0, 10);
			base.AddElementFieldInfo("AttributeValueEntity", "Value", typeof(System.String), false, false, false, true,  (int)AttributeValueFieldIndex.Value, 500, 0, 0);
			base.AddElementFieldInfo("AttributeValueEntity", "Literal", typeof(System.Boolean), false, false, false, false,  (int)AttributeValueFieldIndex.Literal, 0, 0, 1);
			base.AddElementFieldInfo("AttributeValueEntity", "Order", typeof(System.Int32), false, false, false, false,  (int)AttributeValueFieldIndex.Order, 0, 0, 10);
		}
		/// <summary>Inits CombineModeEntity's FieldInfo objects</summary>
		private void InitCombineModeEntityInfos()
		{
			base.AddElementFieldInfo("CombineModeEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)CombineModeFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("CombineModeEntity", "Name", typeof(System.String), false, false, false, false,  (int)CombineModeFieldIndex.Name, 250, 0, 0);
		}
		/// <summary>Inits ContextEntity's FieldInfo objects</summary>
		private void InitContextEntityInfos()
		{
			base.AddElementFieldInfo("ContextEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)ContextFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("ContextEntity", "Name", typeof(System.String), false, false, false, false,  (int)ContextFieldIndex.Name, 250, 0, 0);
		}
		/// <summary>Inits DecisionNodeEntity's FieldInfo objects</summary>
		private void InitDecisionNodeEntityInfos()
		{
			base.AddElementFieldInfo("DecisionNodeEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)DecisionNodeFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("DecisionNodeEntity", "ParentId", typeof(Nullable<System.Int32>), false, true, false, true,  (int)DecisionNodeFieldIndex.ParentId, 0, 0, 10);
			base.AddElementFieldInfo("DecisionNodeEntity", "Type", typeof(System.Int32), false, false, false, false,  (int)DecisionNodeFieldIndex.Type, 0, 0, 10);
			base.AddElementFieldInfo("DecisionNodeEntity", "CombineAnd", typeof(System.Boolean), false, false, false, false,  (int)DecisionNodeFieldIndex.CombineAnd, 0, 0, 1);
			base.AddElementFieldInfo("DecisionNodeEntity", "AttributeId", typeof(Nullable<System.Int32>), false, true, false, true,  (int)DecisionNodeFieldIndex.AttributeId, 0, 0, 10);
			base.AddElementFieldInfo("DecisionNodeEntity", "Extra", typeof(System.String), false, false, false, true,  (int)DecisionNodeFieldIndex.Extra, 250, 0, 0);
			base.AddElementFieldInfo("DecisionNodeEntity", "Order", typeof(System.Int32), false, false, false, false,  (int)DecisionNodeFieldIndex.Order, 0, 0, 10);
		}
		/// <summary>Inits EffectEntity's FieldInfo objects</summary>
		private void InitEffectEntityInfos()
		{
			base.AddElementFieldInfo("EffectEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)EffectFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("EffectEntity", "Name", typeof(System.String), false, false, false, false,  (int)EffectFieldIndex.Name, 250, 0, 0);
		}
		/// <summary>Inits LibraryEntity's FieldInfo objects</summary>
		private void InitLibraryEntityInfos()
		{
			base.AddElementFieldInfo("LibraryEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)LibraryFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("LibraryEntity", "Name", typeof(System.String), false, false, false, false,  (int)LibraryFieldIndex.Name, 500, 0, 0);
			base.AddElementFieldInfo("LibraryEntity", "Locked", typeof(System.Boolean), false, false, false, false,  (int)LibraryFieldIndex.Locked, 0, 0, 1);
		}
		/// <summary>Inits PolicyEntity's FieldInfo objects</summary>
		private void InitPolicyEntityInfos()
		{
			base.AddElementFieldInfo("PolicyEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)PolicyFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("PolicyEntity", "LibraryId", typeof(System.Int32), false, true, false, false,  (int)PolicyFieldIndex.LibraryId, 0, 0, 10);
			base.AddElementFieldInfo("PolicyEntity", "Uid", typeof(System.Guid), false, false, false, false,  (int)PolicyFieldIndex.Uid, 0, 0, 0);
			base.AddElementFieldInfo("PolicyEntity", "Description", typeof(System.String), false, false, false, false,  (int)PolicyFieldIndex.Description, 500, 0, 0);
			base.AddElementFieldInfo("PolicyEntity", "TargetId", typeof(System.Int32), false, true, false, false,  (int)PolicyFieldIndex.TargetId, 0, 0, 10);
			base.AddElementFieldInfo("PolicyEntity", "CombineModeId", typeof(System.Int32), false, true, false, false,  (int)PolicyFieldIndex.CombineModeId, 0, 0, 10);
			base.AddElementFieldInfo("PolicyEntity", "Set", typeof(System.Boolean), false, false, false, false,  (int)PolicyFieldIndex.Set, 0, 0, 1);
			base.AddElementFieldInfo("PolicyEntity", "IsLibrary", typeof(System.Boolean), false, false, false, false,  (int)PolicyFieldIndex.IsLibrary, 0, 0, 1);
		}
		/// <summary>Inits PolicyDocumentEntity's FieldInfo objects</summary>
		private void InitPolicyDocumentEntityInfos()
		{
			base.AddElementFieldInfo("PolicyDocumentEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)PolicyDocumentFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("PolicyDocumentEntity", "LibraryId", typeof(System.Int32), false, true, false, false,  (int)PolicyDocumentFieldIndex.LibraryId, 0, 0, 10);
			base.AddElementFieldInfo("PolicyDocumentEntity", "Name", typeof(System.String), false, false, false, false,  (int)PolicyDocumentFieldIndex.Name, 250, 0, 0);
			base.AddElementFieldInfo("PolicyDocumentEntity", "PolicyLinkId", typeof(Nullable<System.Int32>), false, true, false, true,  (int)PolicyDocumentFieldIndex.PolicyLinkId, 0, 0, 10);
		}
		/// <summary>Inits PolicyLinkEntity's FieldInfo objects</summary>
		private void InitPolicyLinkEntityInfos()
		{
			base.AddElementFieldInfo("PolicyLinkEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)PolicyLinkFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("PolicyLinkEntity", "PolicyId", typeof(System.Int32), false, true, false, false,  (int)PolicyLinkFieldIndex.PolicyId, 0, 0, 10);
			base.AddElementFieldInfo("PolicyLinkEntity", "ParentId", typeof(Nullable<System.Int32>), false, true, false, true,  (int)PolicyLinkFieldIndex.ParentId, 0, 0, 10);
			base.AddElementFieldInfo("PolicyLinkEntity", "Order", typeof(System.Int32), false, false, false, false,  (int)PolicyLinkFieldIndex.Order, 0, 0, 10);
		}
		/// <summary>Inits QueryEntity's FieldInfo objects</summary>
		private void InitQueryEntityInfos()
		{
			base.AddElementFieldInfo("QueryEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)QueryFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("QueryEntity", "LibraryId", typeof(System.Int32), false, true, false, false,  (int)QueryFieldIndex.LibraryId, 0, 0, 10);
			base.AddElementFieldInfo("QueryEntity", "Description", typeof(System.String), false, false, false, false,  (int)QueryFieldIndex.Description, 250, 0, 0);
		}
		/// <summary>Inits QueryValueEntity's FieldInfo objects</summary>
		private void InitQueryValueEntityInfos()
		{
			base.AddElementFieldInfo("QueryValueEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)QueryValueFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("QueryValueEntity", "QueryId", typeof(System.Int32), false, true, false, false,  (int)QueryValueFieldIndex.QueryId, 0, 0, 10);
			base.AddElementFieldInfo("QueryValueEntity", "AttributeId", typeof(System.Int32), false, true, false, false,  (int)QueryValueFieldIndex.AttributeId, 0, 0, 10);
			base.AddElementFieldInfo("QueryValueEntity", "Extra", typeof(System.String), false, false, false, true,  (int)QueryValueFieldIndex.Extra, 250, 0, 0);
			base.AddElementFieldInfo("QueryValueEntity", "Value", typeof(System.String), false, false, false, false,  (int)QueryValueFieldIndex.Value, 500, 0, 0);
		}
		/// <summary>Inits RuleEntity's FieldInfo objects</summary>
		private void InitRuleEntityInfos()
		{
			base.AddElementFieldInfo("RuleEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)RuleFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("RuleEntity", "PolicyId", typeof(System.Int32), false, true, false, false,  (int)RuleFieldIndex.PolicyId, 0, 0, 10);
			base.AddElementFieldInfo("RuleEntity", "EffectId", typeof(System.Int32), false, true, false, false,  (int)RuleFieldIndex.EffectId, 0, 0, 10);
			base.AddElementFieldInfo("RuleEntity", "ConditionId", typeof(Nullable<System.Int32>), false, true, false, true,  (int)RuleFieldIndex.ConditionId, 0, 0, 10);
			base.AddElementFieldInfo("RuleEntity", "Order", typeof(System.Int32), false, false, false, false,  (int)RuleFieldIndex.Order, 0, 0, 10);
		}
		/// <summary>Inits TargetEntity's FieldInfo objects</summary>
		private void InitTargetEntityInfos()
		{
			base.AddElementFieldInfo("TargetEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)TargetFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("TargetEntity", "Description", typeof(System.String), false, false, false, true,  (int)TargetFieldIndex.Description, 50, 0, 0);
		}
		/// <summary>Inits TargetConditionEntity's FieldInfo objects</summary>
		private void InitTargetConditionEntityInfos()
		{
			base.AddElementFieldInfo("TargetConditionEntity", "TargetId", typeof(System.Int32), true, true, false, false,  (int)TargetConditionFieldIndex.TargetId, 0, 0, 10);
			base.AddElementFieldInfo("TargetConditionEntity", "ConditionId", typeof(System.Int32), true, true, false, false,  (int)TargetConditionFieldIndex.ConditionId, 0, 0, 10);
		}
		/// <summary>Inits UriComponentEntity's FieldInfo objects</summary>
		private void InitUriComponentEntityInfos()
		{
			base.AddElementFieldInfo("UriComponentEntity", "Id", typeof(System.Int32), true, false, true, false,  (int)UriComponentFieldIndex.Id, 0, 0, 10);
			base.AddElementFieldInfo("UriComponentEntity", "Name", typeof(System.String), false, false, false, false,  (int)UriComponentFieldIndex.Name, 50, 0, 0);
		}
		
	}
}




